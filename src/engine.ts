import seed from './seed.json';
export type Role = 'Owner'|'Admin'|'Tutor'|'Portal';
export type Session = typeof seed.sessions[number] & {reason?:string; replaces_id?:string};
export type Assessment = {id:string;enrollment_id:string;rubric_version_id:string;status:string;competencies:Record<string,string>;note:string;author_tutor_id:string;published_at?:string};
export type State = Omit<typeof seed,'sessions'|'assessments'|'tasks'|'enrollments'> & {
  sessions:Session[]; assessments:Assessment[];
  enrollments:(typeof seed.enrollments[number] & {completed_reason?:string})[];
  tasks:{id:string;source_alert_id:string;assignee_id:string;status:string;next_action:string;due_at:string;outcome:string|null}[];
  holds:{id:string;enrollment_id:string;offering_id:string;until:string;status:string}[];
  actions:{id:string;type:string;at:string;detail:string}[];
  followups:{id:string;subject_id:string;outcome:string;note:string;at:string}[];
};
export const STORAGE_KEY='kabrtutor_demo_v1';
function normalizeTimes(value:unknown):unknown{if(typeof value==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(value))return new Date(value).toISOString();if(Array.isArray(value))return value.map(normalizeTimes);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalizeTimes(v)]));return value;}
export const fresh=():State=>{const base=normalizeTimes(seed) as typeof seed;return{...base,assessments:base.assessments.map(a=>({...a,competencies:a.competencies as Record<string,string>})),holds:[],actions:[],followups:[]};};
export const money=(v:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(v);
export const date=(v:string, time=true)=>new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',...(time?{hour:'2-digit',minute:'2-digit'}:{})}).format(new Date(v));
export const balance=(s:State,id:string)=>s.entitlement_ledger.filter(x=>x.entitlement_id===id).reduce((a,x)=>a+x.delta_units,0);
export const due=(s:State,id:string)=>{
 const i=s.invoices.find(x=>x.id===id); if(!i)return 0;
 return i.total_idr-s.allocations.filter(x=>x.invoice_id===id && s.payments.some(p=>p.id===x.payment_id && p.status==='confirmed' && p.received_at<=s.demo_clock)).reduce((a,x)=>a+x.amount_idr,0);
};
export const invoiceStatus=(s:State,id:string)=>{const i=s.invoices.find(x=>x.id===id)!;const d=due(s,id);return d===0?'Lunas':d<i.total_idr?'Sebagian':i.due_at<s.demo_clock?'Jatuh tempo':'Belum dibayar'};
export const activeCount=(s:State,oid?:string)=>s.enrollments.filter(e=>e.status==='active'&&(!oid||e.offering_id===oid)).length;
export const holdsCount=(s:State,oid:string)=>s.holds.filter(h=>h.offering_id===oid&&h.status==='held'&&h.until>s.demo_clock).length;
export const available=(s:State,oid:string)=>s.offerings.find(o=>o.id===oid)!.capacity-activeCount(s,oid)-holdsCount(s,oid);
export function metrics(s:State){
 const cash=s.payments.filter(p=>p.status==='confirmed'&&p.received_at<=s.demo_clock).reduce((a,p)=>a+p.amount_idr,0);
 const receivables=s.invoices.filter(i=>i.document_state==='issued'&&i.issued_at<=s.demo_clock).reduce((a,i)=>a+due(s,i.id),0);
 const completed=s.sessions.filter(x=>x.status==='completed'&&x.ends_at<=s.demo_clock);
 const valuedSessions=s.sessions.filter(x=>(x.status==='completed'&&x.ends_at<=s.demo_clock)||x.status==='cancelled');
 let service=0;
 for(const l of s.entitlement_ledger.filter(l=>l.delta_units<0&&valuedSessions.some(x=>x.id===l.session_id))){const ent=s.entitlements.find(e=>e.id===l.entitlement_id)!;const ord=s.orders.find(o=>o.id===ent.order_id)!;service+=-l.delta_units*ord.amount_idr/8;}
 const costs=s.session_costs.filter(c=>completed.some(x=>x.id===c.session_id)).reduce((a,c)=>a+c.honor_idr+c.room_cost_idr,0);
 return {active:new Set(s.enrollments.filter(e=>e.status==='active').map(e=>e.learner_id)).size,occupied:activeCount(s),capacity:s.offerings.reduce((a,o)=>a+o.capacity,0),cash,receivables,completed:completed.length,service,costs,contribution:service-costs,near:s.entitlements.filter(e=>balance(s,e.id)<=2&&e.valid_from<=s.demo_clock&&e.valid_until>s.demo_clock&&balance(s,e.id)>0).length};
}
export const learnerName=(s:State,eid:string)=>s.learners.find(l=>l.id===s.enrollments.find(e=>e.id===eid)?.learner_id)?.name||eid;
export function eligible(s:State,eid:string,at:string){return s.entitlements.filter(e=>e.enrollment_id===eid&&e.valid_from<=at&&e.valid_until>at&&balance(s,e.id)>0).sort((a,b)=>a.valid_until.localeCompare(b.valid_until));}
export function roster(s:State,sid:string){const session=s.sessions.find(x=>x.id===sid)!;return s.session_participants.filter(p=>p.session_id===sid&&p.booking_status==='confirmed').filter(p=>eligible(s,p.enrollment_id,session.starts_at).length>0);}
export type Command =
 |{type:'assign';taskId:string;staffId:string}
 |{type:'followup';subjectId:string;note:string;outcome:string}
 |{type:'enroll';leadId:string;offeringId:string}
 |{type:'pay';invoiceId:string;amount:number;key:string}
 |{type:'clock';at:string}
 |{type:'attendance';sessionId:string;enrollmentId:string;status:string}
 |{type:'start'|'complete';sessionId:string}
 |{type:'reschedule';sessionId:string;startsAt:string;endsAt:string;reason:string}
 |{type:'addSession';offeringId:string;startsAt:string;endsAt:string}
 |{type:'cancel';sessionId:string;reason:string;by:'tutor'|'institution'|'learner'}
 |{type:'assessment';enrollmentId:string;note:string;competencies:Record<string,string>;status:'draft'|'submitted'}
 |{type:'publish';assessmentId:string}
 |{type:'finish';enrollmentId:string;reason:string};
function invariant(ok:unknown,msg:string):asserts ok{if(!ok)throw new Error(msg);}
function log(s:State,type:string,detail:string){s.actions.unshift({id:crypto.randomUUID(),type,at:s.demo_clock,detail});}
function collision(s:State,session:Session,exclude?:string){return s.sessions.find(x=>x.id!==exclude&&!['cancelled','rescheduled'].includes(x.status)&&(x.tutor_id===session.tutor_id||x.resource_id===session.resource_id)&&Math.max(+new Date(x.starts_at),+new Date(session.starts_at))<Math.min(+new Date(x.ends_at),+new Date(session.ends_at)));}
function validateSlot(s:State,x:Session,exclude?:string){invariant(Number.isFinite(+new Date(x.starts_at))&&Number.isFinite(+new Date(x.ends_at))&&x.ends_at>x.starts_at,'Waktu selesai harus sesudah waktu mulai.');invariant(x.starts_at>=s.demo_clock,'Jadwal baru tidak boleh di masa lalu simulasi.');const hit=collision(s,x,exclude);invariant(!hit,`Bentrok tutor atau ruang dengan ${hit?.id} (${hit?date(hit.starts_at):''}). Pilih slot lain.`);}
function addParticipants(s:State,x:Session){for(const e of s.enrollments.filter(e=>e.offering_id===x.offering_id&&e.status==='active'&&eligible(s,e.id,x.starts_at).length))s.session_participants.push({session_id:x.id,enrollment_id:e.id,booking_status:'confirmed'});}
function consume(s:State,session:Session,eid:string){
 const key=`USE-${eid}-${session.id}`;
 if(s.entitlement_ledger.some(l=>l.session_id===session.id&&s.entitlements.find(e=>e.id===l.entitlement_id)?.enrollment_id===eid&&l.delta_units<0))return;
 const ent=eligible(s,eid,session.starts_at)[0];invariant(ent,'Paket tidak valid atau saldo habis; tinjau peserta terlebih dahulu.');
 s.entitlement_ledger.push({id:key,entitlement_id:ent.id,session_id:session.id,delta_units:-1,kind:'consume',policy_id:session.policy_id,idempotency_key:key});
}
export function execute(current:State,cmd:Command,role:Role='Owner',tutorId='T01'):State{
 const s=structuredClone(current);
 const admin=role==='Owner'||role==='Admin';
 const tutorCommands=['attendance','start','complete','assessment','clock'];
 invariant(admin||(role==='Tutor'&&tutorCommands.includes(cmd.type)),'Aksi ini tidak tersedia untuk role aktif.');
 if('sessionId'in cmd&&role==='Tutor')invariant(s.sessions.find(x=>x.id===cmd.sessionId)?.tutor_id===tutorId,'Sesi ini bukan assignment tutor aktif.');
 switch(cmd.type){
 case 'assign':{const task=s.tasks.find(t=>t.id===cmd.taskId);invariant(task,'Tugas tidak ditemukan.');task.assignee_id=cmd.staffId;log(s,'task_assigned','Tugas ditugaskan ke '+s.staff.find(x=>x.id===cmd.staffId)?.name);break;}
 case 'followup':{
 invariant(cmd.note.trim(),'Catatan tindak lanjut wajib diisi.');s.followups.unshift({id:crypto.randomUUID(),subject_id:cmd.subjectId,note:cmd.note.trim(),outcome:cmd.outcome,at:s.demo_clock});
 const task=s.tasks.find(t=>t.id===cmd.subjectId||t.source_alert_id===cmd.subjectId);if(task){task.outcome=cmd.outcome;task.status='acknowledged';}
 const alert=s.alerts.find(a=>a.id===cmd.subjectId);if(alert)alert.status='acknowledged';
 const lead=s.leads.find(l=>l.id===cmd.subjectId);if(lead){lead.stage=cmd.outcome==='agreed'?'agreed':lead.stage;lead.last_contact_at=s.demo_clock;}
 log(s,'lead_reviewed',cmd.note.trim());break;}
 case 'enroll':{
 const lead=s.leads.find(l=>l.id===cmd.leadId),off=s.offerings.find(o=>o.id===cmd.offeringId);invariant(lead&&off,'Lead atau kelas tidak ditemukan.');invariant(!['pending','enrolled'].includes(lead.stage),'Lead sudah memiliki pendaftaran.');invariant(available(s,off.id)>0,'Kapasitas kelas sudah penuh termasuk reservasi aktif.');
 const n=lead.id==='LEAD01'?41:Math.max(42,...s.learners.map(l=>Number(l.id.slice(1))+1));const suffix=String(n).padStart(3,'0');const lid='L'+suffix,eid='E'+suffix,oid='ORD'+suffix,iid='INV'+suffix;
 const gid=lead.guardian_name?'G-LEAD-'+lead.id:lid;
 if(lead.guardian_name){s.guardians.push({id:gid,name:lead.guardian_name,synthetic:true});s.guardian_links.push({guardian_id:gid,learner_id:lid,verified:true,can_view_published_progress:true,can_view_billing:true});}
 s.learners.push({id:lid,name:lead.name,age:lead.guardian_name?10:25,status:'pending',synthetic:true});
 s.enrollments.push({id:eid,learner_id:lid,offering_id:off.id,status:'pending',activated_at:s.demo_clock});s.orders.push({id:oid,enrollment_id:eid,kind:'initial',amount_idr:off.price_idr,status:'placed',price_snapshot_id:off.id+'-8x-v1'});
 s.invoices.push({id:iid,order_id:oid,total_idr:off.price_idr,issued_at:s.demo_clock,due_at:new Date(+new Date(s.demo_clock)+86400000).toISOString(),document_state:'issued',payer_person_id:gid});
 s.holds.push({id:'HOLD-'+eid,enrollment_id:eid,offering_id:off.id,until:new Date(+new Date(s.demo_clock)+86400000).toISOString(),status:'held'});lead.stage='pending';log(s,'enrollment_created',`${lead.name} terdaftar pending · ${iid} · reservasi 24 jam`);break;}
 case 'pay':{
 const old=s.payments.find(p=>p.idempotency_key===cmd.key);if(old){invariant(old.amount_idr===cmd.amount&&s.allocations.some(a=>a.payment_id===old.id&&a.invoice_id===cmd.invoiceId),'Token pembayaran sudah digunakan untuk transaksi berbeda.');return current;}
 const inv=s.invoices.find(i=>i.id===cmd.invoiceId);invariant(inv&&inv.document_state==='issued','Invoice tidak ditemukan.');invariant(Number.isSafeInteger(cmd.amount)&&cmd.amount>0&&cmd.amount<=due(s,inv.id),'Nominal harus positif dan tidak melebihi sisa tagihan.');
 const order=s.orders.find(o=>o.id===inv.order_id)!,en=s.enrollments.find(e=>e.id===order.enrollment_id)!;
 const isFinal=cmd.amount===due(s,inv.id);if(isFinal&&en.status==='pending'){
 const held=s.holds.some(h=>h.enrollment_id===en.id&&h.status==='held'&&h.until>s.demo_clock);invariant(held||available(s,en.offering_id)>0,'Reservasi sudah habis dan kelas penuh. Pilih kelas lain sebelum pelunasan.');}
 const pid='PAY-'+cmd.key;s.payments.push({id:pid,amount_idr:cmd.amount,received_at:s.demo_clock,status:'confirmed',method:'manual_demo',idempotency_key:cmd.key});s.allocations.push({invoice_id:inv.id,payment_id:pid,amount_idr:cmd.amount});
 if(due(s,inv.id)===0&&!s.entitlements.some(e=>e.order_id===order.id)){
 const entid=order.kind==='initial'?'ENT'+en.id.slice(1):'ENT-'+order.id;
 s.entitlements.push({id:entid,order_id:order.id,enrollment_id:en.id,valid_from:s.demo_clock,valid_until:new Date(+new Date(s.demo_clock)+60*86400000).toISOString(),granted_units_metadata:8});s.entitlement_ledger.push({id:'GRANT-'+entid,entitlement_id:entid,delta_units:8,kind:'grant',idempotency_key:'GRANT-'+order.id});order.status='fulfilled';
 if(en.status==='pending'){en.status='active';en.activated_at=s.demo_clock;s.learners.find(l=>l.id===en.learner_id)!.status='active';s.holds.filter(h=>h.enrollment_id===en.id).forEach(h=>h.status='converted');
 for(const session of s.sessions.filter(x=>x.offering_id===en.offering_id&&x.status==='scheduled'&&x.starts_at>=s.demo_clock&&eligible(s,en.id,x.starts_at).length))s.session_participants.push({session_id:session.id,enrollment_id:en.id,booking_status:'confirmed'});
 const lead=s.leads.find(l=>l.name===s.learners.find(l=>l.id===en.learner_id)?.name);if(lead)lead.stage='enrolled';}
 log(s,'enrollment_activated',`${inv.id} lunas · paket baru +8 sesi`);
 }else log(s,'payment_partial_recorded',`${inv.id} menerima ${money(cmd.amount)}`);break;}
 case 'clock':invariant(Number.isFinite(+new Date(cmd.at))&&+new Date(cmd.at)>=+new Date(s.demo_clock),'Waktu simulasi hanya dapat dimajukan.');s.demo_clock=new Date(cmd.at).toISOString();s.holds.filter(h=>h.status==='held'&&h.until<=s.demo_clock).forEach(h=>h.status='expired');log(s,'clock_advanced','Waktu simulasi dimajukan');break;
 case 'attendance':{
 const session=s.sessions.find(x=>x.id===cmd.sessionId)!;invariant(session&&session.status==='in_progress','Mulai sesi sebelum mengisi absensi.');invariant(roster(s,session.id).some(p=>p.enrollment_id===cmd.enrollmentId),'Peserta tidak eligible.');invariant(['present','late','absent'].includes(cmd.status),'Status tidak valid.');const a=s.attendance.find(a=>a.session_id===session.id&&a.enrollment_id===cmd.enrollmentId);if(a)a.status=cmd.status;else s.attendance.push({session_id:session.id,enrollment_id:cmd.enrollmentId,status:cmd.status});break;}
 case 'start':{const session=s.sessions.find(x=>x.id===cmd.sessionId);invariant(session&&session.status==='scheduled','Sesi tidak dapat dimulai.');invariant(+new Date(s.demo_clock)>=+new Date(session.starts_at),'Majukan waktu simulasi ke waktu sesi.');session.status='in_progress';log(s,'session_started','Sesi '+session.id+' dimulai');break;}
 case 'complete':{
 const session=s.sessions.find(x=>x.id===cmd.sessionId);invariant(session,'Sesi tidak ditemukan.');if(session.status==='completed')return current;invariant(session.status==='in_progress','Mulai sesi terlebih dahulu.');invariant(+new Date(s.demo_clock)>=+new Date(session.ends_at),'Majukan waktu simulasi sampai akhir sesi.');const people=roster(s,session.id);invariant(people.length,'Tidak ada peserta eligible; tinjau roster.');
 for(const p of people){invariant(s.attendance.some(a=>a.session_id===session.id&&a.enrollment_id===p.enrollment_id),'Lengkapi absensi seluruh peserta eligible.');consume(s,session,p.enrollment_id);}
 session.status='completed';const off=s.offerings.find(o=>o.id===session.offering_id)!;if(!s.session_costs.some(c=>c.session_id===session.id))s.session_costs.push({session_id:session.id,honor_idr:off.honor_per_session_idr,room_cost_idr:off.room_cost_per_session_idr,basis:'fixed per completed session; illustrative cost estimate'});log(s,'session_completed',`${session.id} selesai · ${people.length} unit layanan tercatat`);break;}
 case 'reschedule':{
 const old=s.sessions.find(x=>x.id===cmd.sessionId);invariant(old&&!['completed','rescheduled'].includes(old.status),'Sesi ini tidak dapat dijadwal ulang.');invariant(cmd.reason.trim(),'Alasan wajib diisi.');const next={...old,id:old.id+'-R'+(old.version+1),starts_at:new Date(cmd.startsAt).toISOString(),ends_at:new Date(cmd.endsAt).toISOString(),status:'scheduled',version:old.version+1,reason:cmd.reason,replaces_id:old.id};validateSlot(s,next,old.id);old.status='rescheduled';old.reason=cmd.reason;s.sessions.push(next);addParticipants(s,next);log(s,'session_rescheduled',`${old.id} → ${next.id}: ${cmd.reason}`);break;}
 case 'addSession':{
 const o=s.offerings.find(o=>o.id===cmd.offeringId);invariant(o,'Kelas tidak ditemukan.');const next:Session={id:'SESSION-'+crypto.randomUUID().slice(0,8),offering_id:o.id,tutor_id:o.tutor_id,resource_id:o.resource_id,starts_at:new Date(cmd.startsAt).toISOString(),ends_at:new Date(cmd.endsAt).toISOString(),status:'scheduled',policy_id:s.policy.id,version:1};validateSlot(s,next);s.sessions.push(next);addParticipants(s,next);log(s,'session_added','Sesi '+o.name+' ditambahkan');break;}
 case 'cancel':{
 const session=s.sessions.find(x=>x.id===cmd.sessionId);invariant(session&&['scheduled','in_progress'].includes(session.status),'Sesi ini tidak dapat dibatalkan.');invariant(cmd.reason.trim(),'Alasan pembatalan wajib diisi.');const off=s.offerings.find(o=>o.id===session.offering_id)!;invariant(cmd.by!=='learner'||off.mode==='private','Pembatalan peserta hanya untuk sesi privat.');if(cmd.by==='learner'&&+new Date(session.starts_at)-+new Date(s.demo_clock)<24*3600000){for(const p of roster(s,session.id))consume(s,session,p.enrollment_id);}
 session.status='cancelled';session.reason=cmd.reason;log(s,'session_cancelled',`${session.id}: ${cmd.reason} · ${cmd.by==='learner'?'sesuai kebijakan privat':'tanpa debit paket'}`);break;}
 case 'assessment':{
 const en=s.enrollments.find(e=>e.id===cmd.enrollmentId);invariant(en,'Enrollment tidak ditemukan.');const o=s.offerings.find(o=>o.id===en.offering_id)!;invariant(admin||o.tutor_id===tutorId,'Peserta bukan assignment tutor.');invariant(cmd.note.trim(),'Catatan progres wajib diisi.');const rubric=s.rubric_versions.find(r=>r.program_id===o.program_id)!;invariant(Object.entries(cmd.competencies).every(([k,v])=>rubric.competencies.includes(k)&&rubric.allowed_values.includes(v))&&(cmd.status==='draft'||rubric.competencies.every(k=>rubric.allowed_values.includes(cmd.competencies[k]))),'Lengkapi nilai sesuai rubrik.');const existing=s.assessments.find(a=>a.enrollment_id===en.id&&a.status==='draft');const a:Assessment={id:existing?.id||'AS-'+crypto.randomUUID().slice(0,8),enrollment_id:en.id,rubric_version_id:rubric.id,status:cmd.status,competencies:cmd.competencies,note:cmd.note.trim(),author_tutor_id:o.tutor_id};if(existing)s.assessments[s.assessments.indexOf(existing)]=a;else s.assessments.push(a);log(s,'progress_'+cmd.status,'Progres '+learnerName(s,en.id)+' '+cmd.status);break;}
 case 'publish':{const a=s.assessments.find(a=>a.id===cmd.assessmentId);invariant(a,'Progres tidak ditemukan.');if(a.status==='published')return current;invariant(a.status==='submitted','Tutor harus submit sebelum publikasi.');a.status='published';a.published_at=s.demo_clock;log(s,'progress_published','Progres '+learnerName(s,a.enrollment_id)+' dipublikasikan');break;}
 case 'finish':{const e=s.enrollments.find(e=>e.id===cmd.enrollmentId);invariant(e&&cmd.reason.trim(),'Alasan selesai wajib diisi.');e.status='completed';e.completed_reason=cmd.reason.trim();log(s,'program_completed',learnerName(s,e.id)+' selesai sesuai tujuan: '+cmd.reason);break;}
 }
 return s;
}
export function loadState():{state:State;notice:string}{try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return{state:fresh(),notice:''};const value=JSON.parse(raw);if(value.schema_version!==seed.schema_version||!Array.isArray(value.actions)||!Array.isArray(value.holds))return{state:fresh(),notice:'Versi data berubah. Simulasi dimulai dari awal.'};return{state:normalizeTimes(value) as State,notice:''};}catch{return{state:fresh(),notice:'Penyimpanan browser tidak tersedia atau rusak. Demo menggunakan memori.'};}}
