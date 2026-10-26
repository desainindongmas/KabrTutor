import {balance,due,available,type State} from './engine';
export function reconcileAlerts(s:State):State {
 const findings:{rule:string;subject_id:string;reason:string}[]=[];
 for(const ent of s.entitlements){const enrollment=s.enrollments.find(e=>e.id===ent.enrollment_id);if(enrollment?.status!=='active'||ent.valid_from>s.demo_clock||ent.valid_until<=s.demo_clock)continue;
  const units=balance(s,ent.id),days=(+new Date(ent.valid_until)-+new Date(s.demo_clock))/86400000;
  if(units<=2)findings.push({rule:'package_low',subject_id:ent.id,reason:`Sisa ${units} sesi`});
  if(days<=7)findings.push({rule:'package_expiry',subject_id:ent.id,reason:`Paket berakhir dalam ${Math.ceil(days)} hari`});
 }
 for(const invoice of s.invoices)if(invoice.document_state==='issued'&&invoice.due_at<s.demo_clock&&due(s,invoice.id)>0)findings.push({rule:'invoice_overdue',subject_id:invoice.id,reason:`Tagihan melewati jatuh tempo; sisa Rp${due(s,invoice.id).toLocaleString('id-ID')}`});
 for(const en of s.enrollments.filter(e=>e.status==='active')){const recent=s.attendance.filter(a=>a.enrollment_id===en.id&&s.sessions.some(x=>x.id===a.session_id&&x.status==='completed')).sort((a,b)=>s.sessions.find(x=>x.id===b.session_id)!.starts_at.localeCompare(s.sessions.find(x=>x.id===a.session_id)!.starts_at)).slice(0,2);if(recent.length===2&&recent.every(a=>['absent','no_show'].includes(a.status)))findings.push({rule:'absence_streak',subject_id:en.id,reason:'Dua sesi terakhir tidak hadir; konfirmasi kebutuhan jadwal'});}
 for(const o of s.offerings)if(available(s,o.id)>0)findings.push({rule:'capacity_gap',subject_id:o.id,reason:`${available(s,o.id)} kursi tersedia di ${o.name}`});
 const key=(a:{rule:string;subject_id:string})=>a.rule+':'+a.subject_id;
 // Keep historical findings; resolving a condition never deletes its timeline.
 for(const alert of s.alerts)if(!findings.some(f=>key(f)===key(alert))&&alert.status!=='resolved')alert.status='resolved';
 for(const f of findings){const current=s.alerts.find(a=>key(a)===key(f)&&a.status!=='resolved');if(current){current.reason=f.reason;continue;}const generation=s.alerts.filter(a=>key(a)===key(f)).length+1;const dedupe=key(f)+':'+generation;s.alerts.push({id:'ALERT-'+dedupe,...f,status:'open',assignee_id:'U-ADM1',dedupe_key:dedupe});}
 return s;
}
