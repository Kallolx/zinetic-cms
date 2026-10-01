-- Paid sign-ups from the marketing checkout. A customer pays first, and once the
-- payment is validated the account is approved, the dashboard is unlocked and
-- the wallet is credited automatically, with no wait for an admin.

create table if not exists public.checkout_orders (
  id uuid primary key default gen_random_uuid(),
  tran_id text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  service text not null,                 -- service id from the pricing page
  plan text not null,                    -- plan name
  product text not null,                 -- cms | studio | distribution
  usd_price numeric(12, 2) not null,     -- what is charged
  usd_credit numeric(12, 2) not null,    -- what lands in the wallet
  bdt_amount numeric(12, 2) not null,    -- BDT charged through SSLCommerz
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'held')),
  site_origin text,                      -- where checkout started, to send them back on failure
  val_id text,
  card_type text,
  raw_ipn jsonb,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists checkout_orders_user_idx on public.checkout_orders (user_id);

alter table public.checkout_orders enable row level security;

create policy "Users read their own orders"
  on public.checkout_orders for select
  using (auth.uid() = user_id);

create policy "Admins read all orders"
  on public.checkout_orders for select
  using (public.is_admin());

-- Atomic wallet credit that also writes the ledger row.
create or replace function public.wallet_topup(p_user uuid, p_usd numeric, p_note text)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare new_balance numeric;
begin
  update public.profiles set wallet_balance = wallet_balance + p_usd
   where id = p_user returning wallet_balance into new_balance;
  if p_usd > 0 then
    insert into public.wallet_transactions (user_id, type, amount, note)
    values (p_user, 'topup', p_usd, p_note);
  end if;
  return new_balance;
end;
$$;

revoke all on function public.wallet_topup(uuid, numeric, text) from public, anon, authenticated;
