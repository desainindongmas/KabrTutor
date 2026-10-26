-- Run once in the Supabase SQL editor. Real prospect data only; never import seed.
begin;
create table public.demo_requests (
 id uuid primary key default gen_random_uuid(), idempotency_token uuid not null unique,
 payload_hash text not null, reference text not null unique, payload jsonb not null,
 created_at timestamptz not null default now(), status text not null default 'NEW'
);
create table public.demo_request_email_outbox (
 id uuid primary key default gen_random_uuid(), request_id uuid not null unique references public.demo_requests(id),
 status text not null default 'QUEUED' check(status in ('QUEUED','SENDING','SENT','FAILED')),
 attempt_count integer not null default 0, next_attempt_at timestamptz not null default now(),
 claim_token uuid, lease_until timestamptz, sent_at timestamptz, updated_at timestamptz not null default now()
);
create table public.demo_request_email_attempts (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.demo_request_email_outbox(id),
 attempt_no integer not null, started_at timestamptz not null default now(), finished_at timestamptz,
 status text not null default 'SENDING', detail text, unique(job_id,attempt_no)
);
create table public.demo_request_rate_limits (
 ip_hash text not null, bucket timestamptz not null, count integer not null,
 primary key(ip_hash,bucket)
);
alter table public.demo_requests enable row level security;
alter table public.demo_request_email_outbox enable row level security;
alter table public.demo_request_email_attempts enable row level security;
alter table public.demo_request_rate_limits enable row level security;
revoke all on public.demo_requests,public.demo_request_email_outbox,public.demo_request_email_attempts,public.demo_request_rate_limits from anon,authenticated;
create index on public.demo_request_email_outbox(status,next_attempt_at);

create function public.submit_demo_request(p_token uuid,p_hash text,p_payload jsonb,p_ip_hash text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare existing public.demo_requests; rid uuid; ref text; hits integer; bucket_now timestamptz:=date_trunc('hour',now());
begin
 perform pg_advisory_xact_lock(hashtextextended(p_token::text,0));
 select * into existing from public.demo_requests where idempotency_token=p_token;
 if found then
  if existing.payload_hash<>p_hash then raise exception 'KBT_CONFLICT'; end if;
  return jsonb_build_object('reference',existing.reference,'reused',true);
 end if;
 insert into public.demo_request_rate_limits(ip_hash,bucket,count) values(p_ip_hash,bucket_now,1)
 on conflict(ip_hash,bucket) do update set count=demo_request_rate_limits.count+1 returning count into hits;
 if hits>5 then raise exception 'KBT_RATE'; end if;
 delete from public.demo_request_rate_limits where bucket<now()-interval '2 days';
 -- 12 random hex characters; collision retries stay inside this transaction.
 loop
  ref:='KBT-'||to_char(now() at time zone 'Asia/Jakarta','YYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
  begin
   insert into public.demo_requests(idempotency_token,payload_hash,reference,payload) values(p_token,p_hash,ref,p_payload) returning id into rid;
   exit;
  exception when unique_violation then null;
  end;
 end loop;
 insert into public.demo_request_email_outbox(request_id) values(rid);
 return jsonb_build_object('reference',ref,'reused',false);
end $$;

create function public.claim_demo_request_emails(p_limit integer default 3) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare j public.demo_request_email_outbox; jobs jsonb:='[]'; r public.demo_requests;
begin
 for j in select * from public.demo_request_email_outbox
 where attempt_count<5 and ((status in ('QUEUED','FAILED') and next_attempt_at<=now()) or (status='SENDING' and lease_until<now()))
 order by next_attempt_at for update skip locked limit least(greatest(p_limit,1),3)
 loop
  if j.status='SENDING' then
   update public.demo_request_email_attempts set status='UNKNOWN',finished_at=now(),detail='Lease expired; prior send outcome uncertain. Stable Message-ID reused.' where job_id=j.id and attempt_no=j.attempt_count and status='SENDING';
  end if;
  update public.demo_request_email_outbox set status='SENDING',attempt_count=attempt_count+1,claim_token=gen_random_uuid(),lease_until=now()+interval '5 minutes',updated_at=now() where id=j.id returning * into j;
  insert into public.demo_request_email_attempts(job_id,attempt_no) values(j.id,j.attempt_count);
  select * into r from public.demo_requests where id=j.request_id;
  jobs:=jobs||jsonb_build_array(jsonb_build_object('id',j.id,'request_id',r.id,'claim_token',j.claim_token,'attempt_count',j.attempt_count,'reference',r.reference,'created_at',r.created_at,'payload',r.payload));
 end loop;
 -- A final abandoned lease must not remain SENDING forever.
 update public.demo_request_email_attempts a set status='UNKNOWN',finished_at=now(),detail='Final attempt lease expired; manual review required.'
 from public.demo_request_email_outbox o where a.job_id=o.id and a.attempt_no=o.attempt_count and a.status='SENDING' and o.status='SENDING' and o.attempt_count>=5 and o.lease_until<now();
 update public.demo_request_email_outbox set status='FAILED',updated_at=now() where status='SENDING' and attempt_count>=5 and lease_until<now();
 return jobs;
end $$;

create function public.finish_demo_request_email(p_job_id uuid,p_claim_token uuid,p_status text,p_detail text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare j public.demo_request_email_outbox;
begin
 if p_status not in ('SENT','FAILED') then raise exception 'Invalid email status'; end if;
 select * into j from public.demo_request_email_outbox where id=p_job_id and claim_token=p_claim_token and status='SENDING' for update;
 if not found then raise exception 'Stale email claim'; end if;
 update public.demo_request_email_attempts set status=p_status,finished_at=now(),detail=left(p_detail,500) where job_id=j.id and attempt_no=j.attempt_count;
 update public.demo_request_email_outbox set status=p_status,lease_until=null,claim_token=null,
 sent_at=case when p_status='SENT' then now() else null end,
 next_attempt_at=now()+make_interval(secs=>(60*power(2,j.attempt_count))::integer),updated_at=now() where id=j.id;
end $$;
revoke all on function public.submit_demo_request(uuid,text,jsonb,text),public.claim_demo_request_emails(integer),public.finish_demo_request_email(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.submit_demo_request(uuid,text,jsonb,text),public.claim_demo_request_emails(integer),public.finish_demo_request_email(uuid,uuid,text,text) to service_role;
commit;
