import {it,expect} from 'vitest';
import {fresh,execute} from '../src/engine';
import {reconcileAlerts} from '../src/alerts';
it('deduplicates findings and preserves acknowledgment',()=>{let s=reconcileAlerts(fresh());const a=s.alerts.find(a=>a.rule==='package_low')!;s=execute(s,{type:'followup',subjectId:a.id,note:'Hubungi wali untuk meninjau kelanjutan',outcome:'acknowledged'});const n=s.alerts.length;reconcileAlerts(s);expect(s.alerts.length).toBe(n);expect(s.alerts.find(x=>x.id===a.id)?.status).toBe('acknowledged');});
it('resolves overdue invoices without deleting history after payment',()=>{let s=reconcileAlerts(fresh());const a=s.alerts.find(a=>a.rule==='invoice_overdue'&&a.subject_id==='RINV001')!;s=execute(s,{type:'pay',invoiceId:'RINV001',amount:440000,key:'test-alert'});expect(s.alerts.find(x=>x.id===a.id)?.status).toBe('resolved');});
it('creates expiry alerts when the explicit clock advances',()=>{let s=reconcileAlerts(fresh());s=execute(s,{type:'clock',at:'2026-11-25T09:00:00+07:00'});expect(s.alerts.some(a=>a.rule==='package_expiry'&&a.status==='open')).toBe(true);});
