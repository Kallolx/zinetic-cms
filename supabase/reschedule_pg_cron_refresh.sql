-- Zinetic Music. Change the refresh-pending-checks cadence.
-- Run in Supabase SQL Editor. Swap the schedule string as needed:
--   '*/1 * * * *'  every 1 minute  (testing)
--   '*/3 * * * *'  every 3 minutes
--   '*/5 * * * *'  every 5 minutes (steady state)

select cron.unschedule('refresh-pending-mcn-checks');

select cron.schedule(
  'refresh-pending-mcn-checks',
  '*/1 * * * *',
  $$
  select net.http_get(
    url := 'https://zinetic-cms.vercel.app/api/cron/refresh-pending-checks',
    headers := jsonb_build_object(
      'Authorization', 'Bearer d26e7740a11a7b8e3148b82e6152e328d6da8fbf941f17ecc4df3d1ea16a61e6'
    )
  );
  $$
);
