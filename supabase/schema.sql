-- Zinetic Music — MCN Checker & Copyright/Claim Management
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

-- 1. Profiles ---------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.user_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'user',
  status public.user_status not null default 'pending',
  wallet_balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id)
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- SECURITY DEFINER bypasses RLS for this internal check — a plain subquery
-- on public.profiles inside a policy ON public.profiles would re-trigger
-- the same policy and cause "infinite recursion detected".
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin());

-- auto-create a pending profile row whenever someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Wallet transactions ------------------------------------------------------
create type public.wallet_tx_type as enum ('topup', 'check_charge', 'refund', 'adjustment');

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.wallet_tx_type not null,
  amount numeric(12, 2) not null, -- positive = credit, negative = debit
  note text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Users can view their own transactions"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

create policy "Admins can view all transactions"
  on public.wallet_transactions for select
  using (public.is_admin());

create policy "Admins can insert transactions"
  on public.wallet_transactions for insert
  with check (public.is_admin());

-- 3. MCN checks ---------------------------------------------------------------
create type public.check_status as enum ('success', 'not_found', 'error');

create table public.mcn_checks (
  id uuid primary key default gen_random_uuid(),
  check_number bigint generated always as identity,
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel_input text not null, -- raw URL / handle / ID the user typed
  channel_id text,
  channel_name text,
  network text,
  network_contact_email text,
  subscriber_count bigint,
  total_views bigint,
  video_count integer,
  avatar_url text,
  status public.check_status not null default 'success',
  cost numeric(12, 2) not null default 15,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

alter table public.mcn_checks enable row level security;

create policy "Users can view their own checks"
  on public.mcn_checks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own checks"
  on public.mcn_checks for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all checks"
  on public.mcn_checks for select
  using (public.is_admin());

-- 4. Helper: promote the first admin manually after creating your account --
-- update public.profiles set role = 'admin', status = 'approved' where email = 'you@zineticmusic.com';
