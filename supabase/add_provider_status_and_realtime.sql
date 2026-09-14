-- Zinetic Music. Server-side background refresh + live UI updates for
-- channels the provider is still processing.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

-- 1. A dedicated, indexed column for the provider's own processing state
--    ("pending" while they're still crawling it, "updated" once final),
--    so the cron job can find pending rows without scanning raw_response.
alter table public.mcn_checks add column provider_status text;

update public.mcn_checks
set provider_status = raw_response ->> 'status'
where raw_response is not null;

create index mcn_checks_provider_status_idx
  on public.mcn_checks (provider_status)
  where provider_status = 'pending';

-- 2. Enable Realtime on this table so the dashboard updates itself the
--    instant the cron job writes new network data, no page visit or
--    manual refresh needed.
alter publication supabase_realtime add table public.mcn_checks;
