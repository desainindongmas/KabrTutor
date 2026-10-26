import {it,expect,vi} from 'vitest';
import worker from '../worker';
import {mailSender} from '../server/mail';
it('routes API before SPA and adds security headers',async()=>{const assets=vi.fn(async()=>new Response('<html>app</html>'));const env={ASSETS:{fetch:assets}};const api=await worker.fetch(new Request('https://demo.test/api/demo-requests'),env);expect(api.status).toBe(405);expect(assets).not.toHaveBeenCalled();expect(api.headers.get('X-Frame-Options')).toBe('DENY');const page=await worker.fetch(new Request('https://demo.test/demo/owner'),env);expect(await page.text()).toContain('app');expect((await worker.fetch(new Request('https://demo.test/api/missing'),env)).status).toBe(404);});
it('requires Zoho OAuth credentials before claiming email jobs',()=>{expect(()=>mailSender({})).toThrow('configuration');});
