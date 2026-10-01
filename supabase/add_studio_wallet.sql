-- AI Studio gets its own wallet, separate from the Channel Checker wallet.
-- Each has its own balance, its own transaction list and its own top-up flow.

alter table public.profiles add column if not exists studio_balance numeric(12, 2) not null default 0;

alter table public.wallet_transactions add column if not exists wallet text not null default 'checker'
  check (wallet in ('checker', 'studio'));

-- Studio spending recorded before this change belongs to the Studio ledger
update public.wallet_transactions set wallet = 'studio' where type = 'studio_charge' or note like 'AI Studio%';

alter table public.payment_sessions add column if not exists wallet text not null default 'checker'
  check (wallet in ('checker', 'studio'));

-- Studio charge and refund now move the Studio balance only
create or replace function public.studio_charge(p_user uuid, p_usd numeric, p_note text)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare new_balance numeric;
begin
  update public.profiles
     set studio_balance = studio_balance - p_usd
   where id = p_user and studio_balance >= p_usd
   returning studio_balance into new_balance;
  if new_balance is null then
    return null;
  end if;
  if p_usd > 0 then
    insert into public.wallet_transactions (user_id, type, amount, note, wallet)
    values (p_user, 'studio_charge', -p_usd, p_note, 'studio');
  end if;
  return new_balance;
end;
$$;

create or replace function public.studio_refund(p_user uuid, p_usd numeric, p_note text)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare new_balance numeric;
begin
  update public.profiles set studio_balance = studio_balance + p_usd
   where id = p_user returning studio_balance into new_balance;
  if p_usd > 0 then
    insert into public.wallet_transactions (user_id, type, amount, note, wallet)
    values (p_user, 'refund', p_usd, p_note, 'studio');
  end if;
  return new_balance;
end;
$$;

create or replace function public.studio_topup(p_user uuid, p_usd numeric, p_note text)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare new_balance numeric;
begin
  update public.profiles set studio_balance = studio_balance + p_usd
   where id = p_user returning studio_balance into new_balance;
  if p_usd > 0 then
    insert into public.wallet_transactions (user_id, type, amount, note, wallet)
    values (p_user, 'topup', p_usd, p_note, 'studio');
  end if;
  return new_balance;
end;
$$;

revoke all on function public.studio_charge(uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.studio_refund(uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.studio_topup(uuid, numeric, text) from public, anon, authenticated;
