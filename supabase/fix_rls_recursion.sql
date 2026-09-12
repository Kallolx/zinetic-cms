-- Fixes "infinite recursion detected in policy for relation profiles":
-- the admin policies queried public.profiles from within a policy ON
-- public.profiles, re-triggering themselves. A SECURITY DEFINER function
-- bypasses RLS for that internal check, breaking the recursion.

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

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin());

drop policy if exists "Admins can view all transactions" on public.wallet_transactions;
create policy "Admins can view all transactions"
  on public.wallet_transactions for select
  using (public.is_admin());

drop policy if exists "Admins can insert transactions" on public.wallet_transactions;
create policy "Admins can insert transactions"
  on public.wallet_transactions for insert
  with check (public.is_admin());

drop policy if exists "Admins can view all checks" on public.mcn_checks;
create policy "Admins can view all checks"
  on public.mcn_checks for select
  using (public.is_admin());
