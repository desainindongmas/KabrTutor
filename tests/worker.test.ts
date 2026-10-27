import {it,expect} from 'vitest';
import {onRequest} from '../functions/api/demo-requests';
import {onRequest as unknownApi} from '../functions/api/[[path]]';
import worker from '../worker';
import {mailSender} from '../server/mail';
it('Pages API keeps method validation and security headers',async()=>{const r=await onRequest({request:new Request('https://demo.test/api/demo-requests'),env:{}});expect(r.status).toBe(405);expect(r.headers.get('X-Frame-Options')).toBe('DENY');expect(unknownApi().status).toBe(404);});
it('email worker exposes no public send endpoint',()=>{expect(worker.fetch().status).toBe(404);expect(()=>mailSender({})).toThrow('configuration');});
