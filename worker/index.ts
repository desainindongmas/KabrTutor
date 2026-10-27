import {outboxStore,type DatabaseEnv} from '../server/store';
import {mailSender,runOutbox,type MailEnv} from '../server/mail';
export type Env=DatabaseEnv&MailEnv;
export default {
 fetch(){return new Response('Not found',{status:404});},
 async scheduled(_event:unknown,env:Env){const sender=mailSender(env);const result=await runOutbox(outboxStore(env),sender);console.info('KabrTutor outbox',result);}
};
