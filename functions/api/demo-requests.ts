import {makeRequestHandler} from '../../server/request';
import {requestStore,type DatabaseEnv} from '../../server/store';
export type PagesEnv=DatabaseEnv&{RATE_LIMIT_SECRET?:string};
export async function onRequest({request,env}:{request:Request;env:PagesEnv}){
 const response=await makeRequestHandler(()=>requestStore(env),()=>env.RATE_LIMIT_SECRET||'')(request,{ip:request.headers.get('CF-Connecting-IP')||'unknown'});
 const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('X-Frame-Options','DENY');
 return new Response(response.body,{status:response.status,headers});
}
