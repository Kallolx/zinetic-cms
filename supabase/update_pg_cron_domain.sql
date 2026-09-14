-- Zinetic Music. Point pg_cron at the branded domain now that it's live.
-- Run in Supabase SQL Editor.

select cron.unschedule('refresh-pending-mcn-checks');

select cron.schedule(
  'refresh-pending-mcn-checks',
  '*/1 * * * *',
  $$
  select net.http_get(
    url := 'https://cms.zineticmusic.com/api/cron/refresh-pending-checks',
    headers := jsonb_build_object(
      'Authorization', 'Bearer d26e7740a11a7b8e3148b82e6152e328d6da8fbf941f17ecc4df3d1ea16a61e6'
    )
  );
  $$
);
