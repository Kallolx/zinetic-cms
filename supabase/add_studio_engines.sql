-- AI Studio engines: Service -> Engine -> Provider -> Model/endpoint -> Credit cost.
-- Managed from /admin/engines, nothing about a provider is hard-coded in the app.

alter type public.wallet_tx_type add value if not exists 'studio_charge';

create table if not exists public.studio_engines (
  id uuid primary key default gen_random_uuid(),
  service text not null,                 -- tool id: voice, dubbing, video-translation ...
  key text not null,                     -- stable id inside the service: v1, v2, v3 ...
  label text not null,                   -- what customers see: Engine 1
  description text,
  provider text not null,                -- elevenlabs | heygen | local | (future providers)
  model text,                            -- model id or API endpoint variant
  credit_cost numeric(10, 3) not null default 0,
  cost_unit text not null default 'generation' check (cost_unit in ('generation', 'minute', '1k_chars')),
  enabled boolean not null default true,
  features text[] not null default '{}',
  max_duration_seconds integer,          -- longest media accepted, null = no limit
  max_file_mb integer,
  max_chars integer,
  options jsonb not null default '{}'::jsonb,   -- processing options / defaults
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service, key)
);

alter table public.studio_engines enable row level security;

create policy "Signed-in users read enabled engines"
  on public.studio_engines for select
  using (enabled and auth.uid() is not null);

create policy "Admins read all engines"
  on public.studio_engines for select
  using (public.is_admin());

-- every generation remembers which engine ran and what it cost
alter table public.studio_generations add column if not exists engine_key text;
alter table public.studio_generations add column if not exists credits numeric(10, 3) not null default 0;
alter table public.studio_generations add column if not exists refunded boolean not null default false;

-- Atomic wallet debit: only succeeds when the balance covers it.
create or replace function public.studio_charge(p_user uuid, p_usd numeric, p_note text)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare new_balance numeric;
begin
  update public.profiles
     set wallet_balance = wallet_balance - p_usd
   where id = p_user and wallet_balance >= p_usd
   returning wallet_balance into new_balance;
  if new_balance is null then
    return null;
  end if;
  if p_usd > 0 then
    insert into public.wallet_transactions (user_id, type, amount, note)
    values (p_user, 'studio_charge', -p_usd, p_note);
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
  update public.profiles set wallet_balance = wallet_balance + p_usd
   where id = p_user returning wallet_balance into new_balance;
  if p_usd > 0 then
    insert into public.wallet_transactions (user_id, type, amount, note)
    values (p_user, 'refund', p_usd, p_note);
  end if;
  return new_balance;
end;
$$;

revoke all on function public.studio_charge(uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.studio_refund(uuid, numeric, text) from public, anon, authenticated;

-- Starting engines. Costs are placeholders, set the real ones in /admin/engines.
insert into public.studio_engines
  (service, key, label, description, provider, model, credit_cost, cost_unit, features, max_duration_seconds, max_file_mb, max_chars, options, sort)
values
  ('voice', 'v1', 'Engine 1', 'Natural multilingual voices', 'elevenlabs', 'eleven_multilingual_v2', 0.02, '1k_chars', '{multilingual}', null, null, 5000, '{}', 1),
  ('voice-changer', 'v1', 'Engine 1', 'Keeps timing and emotion', 'elevenlabs', 'eleven_multilingual_sts_v2', 0.10, 'minute', '{}', 600, 50, null, '{}', 1),
  ('sound-effects', 'v1', 'Engine 1', 'Text to sound effects', 'elevenlabs', 'eleven_text_to_sound_v2', 0.03, 'generation', '{loop}', 30, null, 450, '{}', 1),
  ('music', 'v1', 'Engine 1', 'Full tracks from a prompt', 'elevenlabs', 'music_v1', 0.30, 'minute', '{}', 120, null, 1500, '{}', 1),
  ('transcribe', 'v1', 'Engine 1', 'Speakers and timestamps', 'elevenlabs', 'scribe_v1', 0.03, 'minute', '{speakers,timestamps}', 7200, 200, null, '{}', 1),
  ('audio-cleaner', 'v1', 'Engine 1', 'Noise removal and voice isolation', 'elevenlabs', 'audio-isolation', 0.05, 'minute', '{}', 600, 100, null, '{}', 1),
  ('dubbing', 'v1', 'Engine 1', 'Keeps each speaker''s own voice', 'elevenlabs', 'dubbing', 0.30, 'minute', '{audio,video,speaker-voices}', 1800, 200, null, '{}', 1),
  ('dubbing', 'v2', 'Engine 2', 'Video dubbing with lip sync', 'heygen', 'video_translate', 0.50, 'minute', '{video,lipsync}', 600, 200, null, '{"lipsync":true}', 2),
  ('video-translation', 'v1', 'Engine 1', 'Translation with lip sync', 'heygen', 'video_translate', 0.50, 'minute', '{video,lipsync}', 600, 200, null, '{"lipsync":true}', 1),
  ('video-translation', 'v2', 'Engine 2', 'Translated voice, original picture', 'elevenlabs', 'dubbing', 0.30, 'minute', '{video,speaker-voices}', 1800, 200, null, '{}', 2),
  ('avatar-video', 'v1', 'Engine 1', 'Presenter avatars', 'heygen', 'v2/video/generate', 0.50, 'generation', '{avatars,photo-avatars}', null, null, 4000, '{}', 1),
  ('avatar-creator', 'v1', 'Engine 1', 'Photo avatars', 'heygen', 'asset/upload', 0, 'generation', '{}', null, 10, null, '{}', 1),
  ('prompt-video', 'v1', 'Engine 1', 'Video from a prompt', 'heygen', 'v1/video_agent/generate', 1.00, 'generation', '{}', null, null, 2000, '{}', 1),
  ('short-clips', 'v1', 'Engine 1', 'Best moments, cut to size', 'local', 'ffmpeg+scribe_v1', 0.05, 'minute', '{vertical}', 7200, 200, null, '{}', 1),
  ('filler-remover', 'v1', 'Engine 1', 'Removes ums and long pauses', 'local', 'ffmpeg+scribe_v1', 0.05, 'minute', '{}', 7200, 200, null, '{}', 1)
on conflict (service, key) do nothing;
