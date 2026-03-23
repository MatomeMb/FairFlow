-- Normalize and enforce unique merchant account emails for OAuth stability.
-- Keeps the oldest row per lower(email), deletes newer duplicates.

begin;

update public.merchant_accounts
set email = lower(trim(email))
where email is not null
  and email <> lower(trim(email));

with ranked as (
  select
    ctid,
    row_number() over (
      partition by lower(email)
      order by created_at asc nulls last, id asc
    ) as rn
  from public.merchant_accounts
  where email is not null
    and trim(email) <> ''
)
delete from public.merchant_accounts m
using ranked r
where m.ctid = r.ctid
  and r.rn > 1;

create unique index if not exists merchant_accounts_email_unique_ci
  on public.merchant_accounts (lower(email))
  where email is not null and trim(email) <> '';

commit;
