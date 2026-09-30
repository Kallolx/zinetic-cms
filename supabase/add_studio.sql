-- AI Studio: one row per generation (voice, video, ...). Files live in
-- storage (local disk for now), only the relative key is stored here.
create type public.studio_kind as enum ('voice', 'sfx', 'avatar_video', 'video_translate');
create type public.studio_status as enum ('processing', 'done', 'failed');

create table public.studio_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.studio_kind not null,
  provider text not null,
  status public.studio_status not null default 'processing',
  input jsonb not null default '{}'::jsonb,
  file_key text,
  mime_type text,
  provider_job_id text,
  error text,
  created_at timestamptz not null default now()
);

create index studio_generations_user_idx on public.studio_generations (user_id, created_at desc);

alter table public.studio_generations enable row level security;

create policy "Users read their own generations"
  on public.studio_generations for select
  using (auth.uid() = user_id);

create policy "Admins read all generations"
  on public.studio_generations for select
  using (public.is_admin());
