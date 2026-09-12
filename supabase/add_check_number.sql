-- Adds a short, human-friendly sequential ID to each check (shown as "#12345"
-- in the UI), separate from the internal UUID used in URLs.
alter table public.mcn_checks
  add column check_number bigint generated always as identity;
