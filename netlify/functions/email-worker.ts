import {mailSender,runOutbox} from '../../server/mail';
import {outboxStore} from '../../server/store';
export default async()=>{try{const sender=mailSender();const result=await runOutbox(outboxStore(),sender);console.info('KabrTutor outbox summary',result);return new Response(null,{status:204});}catch{console.error('KabrTutor outbox unavailable; inspect service configuration and job status.');return new Response(null,{status:503});}};
