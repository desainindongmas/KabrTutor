from pathlib import Path
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import json, hashlib
ROOT=Path(__file__).resolve().parent
TZ=ZoneInfo('Asia/Jakarta')
def ts(day,hour=9,minute=0): return datetime(2026,10,day,hour,minute,tzinfo=TZ).isoformat()
names=['Naya Putri','Fajar Pratama','Adit Saputra','Zahra Kirana','Raka Prakoso','Salma Azzahra','Bima Putra','Cinta Maharani','Daffa Ramadhan','Elin Safira','Farhan Akbar','Gita Anindya','Hana Lestari','Iqbal Maulana','Jihan Amalia','Kevin Aditya','Laras Pertiwi','Malik Ibrahim','Nadia Rahma','Omar Faruq','Putri Anjani','Qila Maharani','Rafi Hidayat','Salsa Nabila','Tegar Wibowo','Ulya Amani','Vina Melati','Wahyu Santoso','Xena Aurelia','Yusuf Hakim','Zaki Firmansyah','Anisa Dewi','Bagas Nugroho','Dina Kartika','Eko Purnomo','Fitri Handayani','Galih Prasetyo','Intan Permata','Dimas Mahendra','Sinta Larasati']
specs=[('O01','P01','Kids A1 Sore','group',10,6,800000,4,'T01','R01',16,150000,50000),('O02','P01','Kids A2','group',12,10,880000,6,'T02','R01',17,170000,50000),('O03','P02','Teen Conversation','group',12,10,960000,3,'T03','R02',17,180000,50000),('O04','P03','Adult Conversation','group',15,12,1200000,2,'T04','R01',19,200000,50000),('O05','P03','Business English Privat Dimas','private',1,1,2400000,6,'T05','R02',18,120000,30000),('O06','P03','Business English Privat Sinta','private',1,1,2400000,4,'T01','R02',15,120000,30000)]
d={'schema_version':'KBT-DEMO-1.0','synthetic':True,'demo_clock':ts(26),'timezone':'Asia/Jakarta','currency':'IDR','organization':{'id':'ORG01','name':'Lentera English Studio — Lembaga Fiktif','branch_id':'BR01','platform_plan':'growth','included_seats':75,'tutor_limit':20},'policy':{'id':'POL-DEMO-1','activation':'full_confirmed_payment','units':8,'expiry_days_from_activation':60,'cancellation_cutoff_hours':24,'no_show_consume':1,'group_reserved_absence_consume':1,'tutor_absence_consume':0,'renewal_units_threshold':2,'expiry_alert_days':7,'package_consumption_order':'earliest_valid_expiry','assessment_publisher':'admin','pending_seat_hold_hours':24},'programs':[{'id':'P01','name':'Kids English','rubric':'RUB-KIDS-1'},{'id':'P02','name':'Teen English','rubric':'RUB-TEEN-1'},{'id':'P03','name':'Adult & Business English','rubric':'RUB-ADULT-1'}],'tutors':[{'id':f'T{i:02}','name':n} for i,n in enumerate(['Rani','Bima','Citra','Dewi','Eka'],1)],'staff':[{'id':'U-OWN','name':'Bu Ratna','role':'owner'},{'id':'U-ADM1','name':'Dewi Admin','role':'admin'},{'id':'U-ADM2','name':'Rizal Admin','role':'admin'}],'resources':[{'id':'R01','name':'Ruang 1','capacity':15},{'id':'R02','name':'Ruang 2','capacity':12}],'learners':[],'guardians':[{'id':'G01','name':'Ibu Maya','synthetic':True}],'guardian_links':[],'offerings':[],'enrollments':[],'orders':[],'invoices':[],'payments':[],'allocations':[],'entitlements':[],'entitlement_ledger':[],'sessions':[],'session_participants':[],'attendance':[],'session_costs':[],'assessments':[],'leads':[],'alerts':[],'tasks':[]}
idx=0
for oid,pid,title,mode,capacity,count,price,completed,tutor,room,hour,wage,roomcost in specs:
    roster=[]
    d['offerings'].append({'id':oid,'program_id':pid,'name':title,'mode':mode,'capacity':capacity,'price_idr':price,'package_units':8,'tutor_id':tutor,'resource_id':room,'hour':hour,'honor_per_session_idr':wage,'room_cost_per_session_idr':roomcost,'level': 'A1' if oid=='O01' else ('A2' if oid=='O02' else 'B1')})
    for _ in range(count):
        idx+=1; lid=f'L{idx:03}'; eid=f'E{idx:03}'; order=f'ORD{idx:03}'; inv=f'INV{idx:03}'; pay=f'PAY{idx:03}'; ent=f'ENT{idx:03}'
        d['learners'].append({'id':lid,'name':names[idx-1],'age':9+(idx%3) if idx<=16 else (15+(idx%2) if idx<=26 else 22+idx%15),'status':'active','synthetic':True})
        d['enrollments'].append({'id':eid,'learner_id':lid,'offering_id':oid,'status':'active','activated_at':ts(1)})
        d['orders'].append({'id':order,'enrollment_id':eid,'kind':'initial','amount_idr':price,'status':'fulfilled','price_snapshot_id':oid+'-8x-v1'})
        d['invoices'].append({'id':inv,'order_id':order,'total_idr':price,'issued_at':ts(1),'due_at':ts(3),'document_state':'issued'})
        d['payments'].append({'id':pay,'amount_idr':price,'received_at':ts(1),'status':'confirmed','method':'manual_demo','idempotency_key':pay})
        d['allocations'].append({'invoice_id':inv,'payment_id':pay,'amount_idr':price})
        d['entitlements'].append({'id':ent,'order_id':order,'enrollment_id':eid,'valid_from':ts(1),'valid_until':(datetime.fromisoformat(ts(1))+timedelta(days=60)).isoformat(),'granted_units_metadata':8})
        d['entitlement_ledger'].append({'id':'GRANT-'+ent,'entitlement_id':ent,'delta_units':8,'kind':'grant','idempotency_key':'GRANT-'+order})
        roster.append((lid,eid,ent))
        if idx<=26:
            gid='G01' if idx<=2 else f'G{idx:02}'
            if idx>2: d['guardians'].append({'id':gid,'name':f'Wali {names[idx-1]}','synthetic':True})
            d['guardian_links'].append({'guardian_id':gid,'learner_id':lid,'verified':True,'can_view_published_progress':True,'can_view_billing':True})
    for j,day in enumerate([5,8,12,15,19,22][:completed],1):
        sid=f'{oid}-H{j:02}'
        d['sessions'].append({'id':sid,'offering_id':oid,'tutor_id':tutor,'resource_id':room,'starts_at':ts(day,hour),'ends_at':ts(day,hour+1),'status':'completed','policy_id':'POL-DEMO-1','version':1})
        d['session_costs'].append({'session_id':sid,'honor_idr':wage,'room_cost_idr':roomcost,'basis':'fixed per completed session; illustrative cost estimate'})
        for lid,eid,ent in roster:
            d['session_participants'].append({'session_id':sid,'enrollment_id':eid,'booking_status':'confirmed'})
            absent=lid=='L040' and j>=completed-1
            d['attendance'].append({'session_id':sid,'enrollment_id':eid,'status':'no_show' if absent else 'present'})
            d['entitlement_ledger'].append({'id':f'USE-{ent}-{sid}','entitlement_id':ent,'session_id':sid,'delta_units':-1,'kind':'consume','policy_id':'POL-DEMO-1','idempotency_key':f'USE-{ent}-{sid}'})
    for day in ([27,29] if oid=='O06' else [26,29]):
        sid=f'{oid}-F{day}'
        d['sessions'].append({'id':sid,'offering_id':oid,'tutor_id':tutor,'resource_id':room,'starts_at':ts(day,hour),'ends_at':ts(day,hour+1),'status':'scheduled','policy_id':'POL-DEMO-1','version':1})
        for lid,eid,ent in roster: d['session_participants'].append({'session_id':sid,'enrollment_id':eid,'booking_status':'confirmed'})
# Payer and verified relationship are distinct from learner identity.
for inv in d['invoices']:
    order=next(o for o in d['orders'] if o['id']==inv['order_id'])
    enrollment=next(e for e in d['enrollments'] if e['id']==order['enrollment_id'])
    lid=enrollment['learner_id']; link=next((g for g in d['guardian_links'] if g['learner_id']==lid),None)
    inv['payer_person_id']=link['guardian_id'] if link else lid
# Six renewal invoices: partial payment creates no new entitlement.
for k,n in enumerate([7,8,9,39,10,11],1):
    e=d['enrollments'][n-1]; o=next(x for x in d['offerings'] if x['id']==e['offering_id']); price=o['price_idr']; inv=f'RINV{k:03}'; order=f'RENEW{k:03}'
    d['orders'].append({'id':order,'enrollment_id':e['id'],'kind':'renewal','amount_idr':price,'status':'placed','price_snapshot_id':o['id']+'-8x-v1'})
    d['invoices'].append({'id':inv,'order_id':order,'total_idr':price,'issued_at':ts(20),'due_at':ts(23),'document_state':'issued','payer_person_id':next((g['guardian_id'] for g in d['guardian_links'] if g['learner_id']==e['learner_id']), e['learner_id'])})
    if k<=4:
        pay=f'RPAY{k:03}'; amt=price//2
        d['payments'].append({'id':pay,'amount_idr':amt,'received_at':ts(21),'status':'confirmed','method':'manual_demo','idempotency_key':pay})
        d['allocations'].append({'invoice_id':inv,'payment_id':pay,'amount_idr':amt})
lead_names=['Alya Rahma','Arga','Bella','Chandra','Dewantara','Elsa','Fauzan','Grace','Hafiz','Indra','Jasmine','Kirana']
for n,name in enumerate(lead_names,1):
    d['leads'].append({'id':f'LEAD{n:02}','name':name,'stage':'qualified' if n<=3 else ('contacted' if n<=6 else 'new'),'target_program_id':'P01' if n<=4 else ('P02' if n<=8 else 'P03'),'level':'A1' if n<=4 else 'B1','requested_slot':'Senin/Kamis 16.00–17.00' if n<=4 else 'Belum dikonfirmasi','assignee_id':'U-ADM1' if n%2 else 'U-ADM2','last_contact_at':ts(24),'synthetic':True,'guardian_name':'Ibu Riska' if n==1 else None})
d['assessments']=[{'id':'AS01','enrollment_id':'E001','rubric_version_id':'RUB-KIDS-1','status':'published','competencies':{'speaking':'Mulai mandiri','listening':'Dengan bantuan ringan'},'note':'Mampu memperkenalkan diri dengan kalimat lengkap.','author_tutor_id':'T01'},{'id':'AS02','enrollment_id':'E002','rubric_version_id':'RUB-KIDS-1','status':'draft','competencies':{'speaking':'Dengan bantuan'},'note':'Draft belum terlihat di portal wali.','author_tutor_id':'T01'}]
balances={e['id']:sum(x['delta_units'] for x in d['entitlement_ledger'] if x['entitlement_id']==e['id']) for e in d['entitlements']}
for ent in d['entitlements']:
    if balances[ent['id']]<=2: d['alerts'].append({'id':'RENEW-'+ent['id'],'rule':'package_low','subject_id':ent['id'],'reason':f"Sisa {balances[ent['id']]} sesi",'status':'open','assignee_id':'U-ADM1','dedupe_key':'LOW-'+ent['id']+'-1'})
for inv in d['invoices']:
    allocated=sum(x['amount_idr'] for x in d['allocations'] if x['invoice_id']==inv['id']); due=inv['total_idr']-allocated
    if due>0: d['alerts'].append({'id':'OVERDUE-'+inv['id'],'rule':'invoice_overdue','subject_id':inv['id'],'reason':'Jatuh tempo 23 Oktober; sisa tagihan belum terbayar','status':'open','assignee_id':'U-ADM2','dedupe_key':'OVERDUE-'+inv['id']+'-1'})
d['alerts'] += [{'id':'CAP-O01','rule':'open_capacity','subject_id':'O01','reason':'6 dari 10 kursi aktif; cocok dengan lead Alya yang level/jadwalnya sudah dikonfirmasi','status':'open','assignee_id':'U-ADM1','dedupe_key':'CAP-O01-1'},{'id':'ATT-E040','rule':'absence_streak','subject_id':'E040','reason':'Tidak hadir dua sesi terakhir; perlu konfirmasi kebutuhan jadwal','status':'open','assignee_id':'U-ADM1','dedupe_key':'ABS-E040-1'}]
d['tasks']=[{'id':'TASK01','source_alert_id':'CAP-O01','assignee_id':'U-ADM1','status':'open','next_action':'Hubungi wali Alya dan konfirmasi penempatan Kids A1 Sore','due_at':ts(26,12),'outcome':None}]
d['platform_plan_catalog']=[{'code':'starter','monthly_idr':79000,'annual_idr':790000,'included_seats':25,'tutor_limit':5},{'code':'growth','monthly_idr':179000,'annual_idr':1790000,'included_seats':75,'tutor_limit':20},{'code':'business','monthly_idr':399000,'annual_idr':3990000,'included_seats':200,'tutor_limit':50}]
d['main_scenario_contract']={'lead_id':'LEAD01','new_learner_id':'L041','new_enrollment_id':'E041','new_order_id':'ORD041','new_invoice_id':'INV041','new_entitlement_id':'ENT041','offering_id':'O01','session_id':'O01-F26','package_price_idr':800000,'partial_payment_idr':300000,'final_payment_idr':500000,'new_learner_final_units':7,'existing_O01_learner_final_units':3,'session_service_value_idr':700000,'session_direct_cost_idr':200000,'session_contribution_idr':500000,'simulation_time_action':'Advance explicit demo clock to 26 October 2026 16:00, then 17:00; never falsify real timestamps.'}
# Concrete rubric versions used by assessments; no real learner evidence files.
d['rubric_versions']=[{'id':'RUB-'+code+'-1','program_id':pid,'version':1,'competencies':['speaking','listening'],'allowed_values':['Dengan bantuan','Dengan bantuan ringan','Mulai mandiri','Mandiri'],'published':True} for code,pid in [('KIDS','P01'),('TEEN','P02'),('ADULT','P03')]]
# Independent referential and arithmetic checks.

for collection in ['learners','enrollments','orders','invoices','payments','entitlements','sessions','alerts']:
    ids=[x['id'] for x in d[collection]]; assert len(ids)==len(set(ids)),collection
assert len(d['learners'])==40 and len(d['leads'])==12
sets={key:{x['id'] for x in d[key]} for key in ['learners','guardians','offerings','enrollments','orders','invoices','payments','entitlements','sessions','tutors','resources','rubric_versions']}
for e in d['enrollments']: assert e['learner_id'] in sets['learners'] and e['offering_id'] in sets['offerings']
for o in d['orders']: assert o['enrollment_id'] in sets['enrollments']
for i in d['invoices']: assert i['order_id'] in sets['orders'] and i['payer_person_id'] in sets['learners']|sets['guardians']
for e in d['entitlements']: assert e['order_id'] in sets['orders'] and e['enrollment_id'] in sets['enrollments']
for g in d['guardian_links']: assert g['guardian_id'] in sets['guardians'] and g['learner_id'] in sets['learners']
for a in d['assessments']: assert a['enrollment_id'] in sets['enrollments'] and a['rubric_version_id'] in sets['rubric_versions']
for s in d['sessions']: assert s['offering_id'] in sets['offerings'] and s['tutor_id'] in sets['tutors'] and s['resource_id'] in sets['resources']
for p in d['session_participants']: assert p['session_id'] in sets['sessions'] and p['enrollment_id'] in sets['enrollments']
for a in d['attendance']: assert a['session_id'] in sets['sessions'] and a['enrollment_id'] in sets['enrollments']
for x in d['entitlement_ledger']:
    assert x['entitlement_id'] in sets['entitlements']
    if x['kind']=='consume': assert x['session_id'] in sets['sessions']
for learner in d['learners']:
    if learner['age']<18: assert any(g['learner_id']==learner['id'] and g['verified'] for g in d['guardian_links'])

for a in d['allocations']:
    assert any(x['id']==a['invoice_id'] for x in d['invoices']) and any(x['id']==a['payment_id'] for x in d['payments'])
for p in d['payments']: assert sum(x['amount_idr'] for x in d['allocations'] if x['payment_id']==p['id'])<=p['amount_idr']
for i in d['invoices']: assert sum(x['amount_idr'] for x in d['allocations'] if x['invoice_id']==i['id'])<=i['total_idr']
for e in d['entitlements']: assert 0<=balances[e['id']]<=8
for o in d['offerings']: assert sum(x['offering_id']==o['id'] and x['status']=='active' for x in d['enrollments'])<=o['capacity']
for j,a in enumerate(d['sessions']):
    for b in d['sessions'][j+1:]:
        overlap=max(a['starts_at'],b['starts_at'])<min(a['ends_at'],b['ends_at'])
        assert not(overlap and (a['tutor_id']==b['tutor_id'] or a['resource_id']==b['resource_id'])),(a['id'],b['id'])
ledgerkeys=[x['idempotency_key'] for x in d['entitlement_ledger']]; assert len(ledgerkeys)==len(set(ledgerkeys))
service_value=sum(next(o for o in d['offerings'] if o['id']==next(s for s in d['sessions'] if s['id']==x['session_id'])['offering_id'])['price_idr']//8 for x in d['entitlement_ledger'] if x['kind']=='consume')
direct_cost=sum(x['honor_idr']+x['room_cost_idr'] for x in d['session_costs'])
summary={'active_unique_learners':40,'capacity_active':40,'capacity_total':sum(x['capacity'] for x in d['offerings']),'issued_invoice_total_idr':sum(x['total_idr'] for x in d['invoices']),'cash_received_idr':sum(x['amount_idr'] for x in d['payments']),'receivables_idr':sum(x['total_idr'] for x in d['invoices'])-sum(x['amount_idr'] for x in d['allocations']),'completed_sessions':sum(x['status']=='completed' for x in d['sessions']),'completed_service_units':sum(x['kind']=='consume' for x in d['entitlement_ledger']),'near_end_packages':sum(v<=2 for v in balances.values()),'simulation_service_value_idr':service_value,'simulation_direct_cost_idr':direct_cost,'simulation_contribution_idr':service_value-direct_cost,'checks':'PASS: IDs, FKs allocations, balances, capacities, interval conflicts, idempotency and totals'}
d['expected_baseline']=summary
source_dir=ROOT.parent/'project_sources'
if source_dir.is_dir():
    d['source_fingerprints']=[{'filename':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(source_dir.iterdir()) if p.is_file()]
else:
    existing=ROOT/'KabrTutor_Demo_Seed_v1.0.json'
    d['source_fingerprints']=json.loads(existing.read_text()).get('source_fingerprints',[]) if existing.exists() else []

(ROOT/'KabrTutor_Demo_Seed_v1.0.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
(ROOT/'dataset_validation.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False,indent=2))
