import {createHash} from 'node:crypto';
import {z} from 'zod';
export const RequestSchema=z.object({
 organization:z.string().trim().min(2).max(160),kind:z.enum(['Bimbel','Kursus bahasa','Les privat','Akademi','Lainnya']),pic:z.string().trim().min(2).max(120),
 whatsapp:z.string().trim().max(24).transform(x=>x.replace(/[\s()-]/g,'').replace(/^\+/, '').replace(/^0/,'62')).pipe(z.string().regex(/^628\d{7,12}$/,'Nomor WhatsApp Indonesia tidak valid.')),
 email:z.union([z.literal(''),z.email().max(254)]).default(''),learnerRange:z.enum(['Belum mulai','1–25','26–75','76–200','Lebih dari 200']),
 need:z.string().trim().min(5).max(2000),note:z.string().trim().max(2000).default(''),referral:z.string().trim().max(64).regex(/^[A-Za-z0-9_-]*$/).default(''),website:z.string().max(0).default('')
}).strict();
export type RequestPayload=z.infer<typeof RequestSchema>;
export type Stored={reference:string;reused:boolean};
export type RequestStore={save:(token:string,hash:string,payload:RequestPayload,ipHash:string)=>Promise<Stored>};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export function makeRequestHandler(getStore:()=>RequestStore,rateSecret:()=>string){return async(req:Request,ctx:{ip?:string}={})=>{
 if(req.method!=='POST')return json({error:'Metode tidak tersedia.'},405);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Origin permintaan tidak sesuai.'},403);
 if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'Gunakan format JSON.'},415);
 const token=req.headers.get('idempotency-key');if(!token||!z.uuid().safeParse(token).success)return json({error:'Token pengajuan tidak valid. Muat ulang form.'},422);
 let payload:RequestPayload;
 try{const text=await req.text();if(Buffer.byteLength(text)>12000)return json({error:'Data terlalu panjang.'},413);const result=RequestSchema.safeParse(JSON.parse(text));if(!result.success)return json({error:'Periksa field wajib, nomor WhatsApp, email, dan panjang isian.'},422);payload=result.data;}catch{return json({error:'Format permintaan tidak valid.'},400);}
 try{const secret=rateSecret();if(!secret)throw new Error('CONFIG');const ipHash=createHash('sha256').update(secret+':'+(ctx.ip||'unknown')).digest('hex');const hash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');const stored=await getStore().save(token,hash,payload,ipHash);return json({reference:stored.reference,emailStatus:'QUEUED'},stored.reused?200:201);
 }catch(e){const code=(e as {code?:string}).code;if(code==='KBT_CONFLICT')return json({error:'Token sudah dipakai untuk data berbeda. Muat ulang form untuk pengajuan baru.'},409);if(code==='KBT_RATE')return json({error:'Terlalu banyak permintaan. Silakan coba lagi dalam satu jam.'},429);return json({error:'Layanan penyimpanan belum tersedia. Permintaan belum dikonfirmasi tersimpan. Silakan coba lagi.'},503);}
 }}
