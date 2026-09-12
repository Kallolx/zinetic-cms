-- Zinetic Music. Add the USD amount actually credited to the wallet,
-- separate from the BDT amount charged through SSLCommerz.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

alter table public.payment_sessions
  add column usd_amount numeric(12, 2);

comment on column public.payment_sessions.amount is
  'BDT amount charged through SSLCommerz, used to validate the IPN.';
comment on column public.payment_sessions.usd_amount is
  'USD amount actually credited to the wallet.';
