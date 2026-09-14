-- Zinetic Music. Have Supabase itself trigger the pending-channel refresh
-- on a schedule, no third-party cron service needed.
-- Run this once in the Supabase SQL editor, AFTER add_provider_status_and_realtime.sql.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- calls the app's cron endpoint every 5 minutes. Replace the url below if
-- the app later moves to a different domain (e.g. zineticmusic.com).
select cron.schedule(
  'refresh-pending-mcn-checks',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://zinetic-cms.vercel.app/api/cron/refresh-pending-checks',
    headers := jsonb_build_object(
      'Authorization', 'Bearer d26e7740a11a7b8e3148b82e6152e328d6da8fbf941f17ecc4df3d1ea16a61e6'
    )
  );
  $$
);

-- to check it's registered:
--   select * from cron.job;
-- to see run history:
--   select * from cron.job_run_details order by start_time desc limit 20;
-- to remove it later:
--   select cron.unschedule('refresh-pending-mcn-checks');
