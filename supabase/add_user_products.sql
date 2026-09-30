-- Which dashboards each customer may open. One row per (user, product).
-- Admins manage this from /admin/products (service role), users can only read their own.
create table public.user_products (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product text not null check (product in ('cms', 'studio', 'distribution')),
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles(id) on delete set null,
  primary key (user_id, product)
);

alter table public.user_products enable row level security;

create policy "Users read their own products"
  on public.user_products for select
  using (auth.uid() = user_id);

create policy "Admins read all products"
  on public.user_products for select
  using (public.is_admin());

-- everyone already approved keeps the checker dashboard they have today
insert into public.user_products (user_id, product)
select id, 'cms' from public.profiles where role = 'user' and status = 'approved'
on conflict do nothing;
