import {makeRequestHandler} from '../server/request';
import {requestStore,outboxStore,type DatabaseEnv} from '../server/store';
import {mailSender,runOutbox,type MailEnv} from '../server/mail';
export type Env=DatabaseEnv&MailEnv&{RATE_LIMIT_SECRET?:string;ASSETS:{fetch:(request:Request)=>Promise<Response>}};
export default {
 async fetch(request:Request,env:Env){
  const path=new URL(request.url).pathname;
  let response:Response;
  if(path==='/api/demo-requests')response=await makeRequestHandler(()=>requestStore(env),()=>env.RATE_LIMIT_SECRET||'')(request,{ip:request.headers.get('CF-Connecting-IP')||'unknown'});
  else if(path.startsWith('/api/'))response=new Response('Not found',{status:404});
  else response=await env.ASSETS.fetch(request);
  const headers=new Headers(response.headers);
  headers.set('X-Content-Type-Options','nosniff');headers.set('X-Frame-Options','DENY');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  return new Response(response.body,{status:response.status,headers});
 },
 async scheduled(_event:unknown,env:Env){const sender=mailSender(env);const result=await runOutbox(outboxStore(env),sender);console.info('KabrTutor outbox',result);}
};
