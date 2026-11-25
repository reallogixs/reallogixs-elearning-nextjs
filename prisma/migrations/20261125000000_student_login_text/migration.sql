-- /login is now for students only. Replaces the old default wording; text an admin wrote is kept.
UPDATE "content_blocks"
SET "value" = "value" || jsonb_build_object('body', 'See your classes, payments and certificates.'), "updated_at" = now()
WHERE "key" = 'pages.login'
  AND "value"->>'body' = 'Students, teachers and admins all log in here. Teacher accounts are created by the Reallogixs team.';

UPDATE "content_blocks"
SET "value" = "value" || jsonb_build_object('asideTitle', 'Everything you''re learning, in one place.'), "updated_at" = now()
WHERE "key" = 'pages.login' AND "value"->>'asideTitle' = 'One login, three portals.';

UPDATE "content_blocks"
SET "value" = "value" || jsonb_build_object('asideBody', 'Open your class link, send a new receipt, and download certificates any time.'), "updated_at" = now()
WHERE "key" = 'pages.login'
  AND "value"->>'asideBody' = 'Students see their courses and receipts. Teachers see referrals and earnings. Admins run the academy.';
