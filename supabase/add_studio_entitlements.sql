-- AI Studio access is per service. A purchase records exactly what was bought
-- (the service, the plan and the amount promised, such as 30,000 characters) and
-- every run deducts from it. Replaces credit charging for Studio.

create table if not exists public.studio_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service text not null,                 -- pricing page service id: voice-generator, dubbing ...
  plan text not null,                    -- Starter, Creator, Pro ...
  unit text not null check (unit in ('characters', 'minutes', 'generations', 'avatars')),
  quota numeric(14, 3) not null,         -- what the plan promised
  used numeric(14, 3) not null default 0,
  expires_at timestamptz,                -- null = does not expire
  source text not null default 'purchase' check (source in ('purchase', 'admin')),
  order_id uuid references public.checkout_orders(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists studio_entitlements_user_service_idx on public.studio_entitlements (user_id, service);

alter table public.studio_entitlements enable row level security;

create policy "Users read their own entitlements"
  on public.studio_entitlements for select
  using (auth.uid() = user_id);

create policy "Admins read all entitlements"
  on public.studio_entitlements for select
  using (public.is_admin());

-- each generation remembers which service plan it drew from and how much
alter table public.studio_generations add column if not exists service text;
alter table public.studio_generations add column if not exists units numeric(14, 3) not null default 0;

-- A purchase made from inside the dashboard returns the customer to that page
alter table public.checkout_orders add column if not exists return_path text not null default '/checkout';

-- Takes `p_amount` from the service's plans, oldest-expiring first. All or nothing.
create or replace function public.studio_consume(p_user uuid, p_service text, p_amount numeric)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  need numeric := p_amount;
  take numeric;
begin
  if p_amount <= 0 then
    return true;
  end if;
  for r in
    select id, quota - used as avail
      from public.studio_entitlements
     where user_id = p_user and service = p_service
       and (expires_at is null or expires_at > now())
       and quota - used > 0
     order by expires_at nulls last, created_at
       for update
  loop
    exit when need <= 0;
    take := least(r.avail, need);
    update public.studio_entitlements set used = used + take where id = r.id;
    need := need - take;
  end loop;
  if need > 0 then
    raise exception 'insufficient';
  end if;
  return true;
end;
$$;

-- Gives back what a failed run took
create or replace function public.studio_restore(p_user uuid, p_service text, p_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  back numeric := p_amount;
  give numeric;
begin
  for r in
    select id, used from public.studio_entitlements
     where user_id = p_user and service = p_service and used > 0
     order by created_at desc
       for update
  loop
    exit when back <= 0;
    give := least(r.used, back);
    update public.studio_entitlements set used = used - give where id = r.id;
    back := back - give;
  end loop;
end;
$$;

revoke all on function public.studio_consume(uuid, text, numeric) from public, anon, authenticated;
revoke all on function public.studio_restore(uuid, text, numeric) from public, anon, authenticated;

-- Engine "credit cost" is now a usage multiplier: 1 = the normal amount comes off the
-- plan, 2 = twice as much. Reset the old placeholder costs to 1.
update public.studio_engines set credit_cost = 1, cost_unit = 'generation';
update public.studio_engines set credit_cost = 1.5 where provider = 'heygen' and service in ('dubbing', 'video-translation');
