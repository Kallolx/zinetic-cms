-- Zinetic Music. SSLCommerz wallet top-up sessions.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create type public.payment_status as enum ('pending', 'valid', 'failed', 'cancelled');

create table public.payment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tran_id text not null unique,
  amount numeric(12, 2) not null,
  status public.payment_status not null default 'pending',
  val_id text,
  card_type text,
  raw_ipn jsonb,
  created_at timestamptz not null default now(),
  validated_at timestamptz
);

alter table public.payment_sessions enable row level security;

create policy "Users can view their own payment sessions"
  on public.payment_sessions for select
  using (auth.uid() = user_id);

create policy "Admins can view all payment sessions"
  on public.payment_sessions for select
  using (public.is_admin());

-- all writes go through the service-role client (init + IPN routes), so no
-- insert/update policy is needed for regular users or admins here.
