-- Zinetic Music. Admin can block an approved user for a terms violation.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

alter type public.user_status add value 'blocked';

alter table public.profiles add column blocked_at timestamptz;
alter table public.profiles add column blocked_reason text;
alter table public.profiles add column blocked_by uuid references auth.users (id);
