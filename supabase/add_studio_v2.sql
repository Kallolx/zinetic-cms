-- AI Studio v2: every tool shares studio_generations. Kind becomes free text so
-- new tools do not need a migration, plus a result blob (transcripts etc).
alter table public.studio_generations alter column kind type text using kind::text;
drop type if exists public.studio_kind;
alter table public.studio_generations add column if not exists title text;
alter table public.studio_generations add column if not exists result jsonb;

-- Photo avatars a customer created, reusable in avatar videos
create table if not exists public.studio_avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  image_key text not null,
  preview_file_key text,
  created_at timestamptz not null default now()
);
alter table public.studio_avatars enable row level security;
create policy "Users read their own avatars" on public.studio_avatars for select using (auth.uid() = user_id);
create policy "Admins read all avatars" on public.studio_avatars for select using (public.is_admin());
