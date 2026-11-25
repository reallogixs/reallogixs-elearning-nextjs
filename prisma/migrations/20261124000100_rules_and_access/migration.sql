-- Value rules: the last line of defence behind the Yup schemas.
ALTER TABLE "users"
  ADD CONSTRAINT "users_email_lower" CHECK (email = lower(email) AND email <> '');
ALTER TABLE "teacher_profiles"
  ADD CONSTRAINT "teacher_promo_format" CHECK (promo_code ~ '^[A-Z0-9-]{4,16}$'),
  ADD CONSTRAINT "teacher_pct_range" CHECK (commission_pct BETWEEN 0 AND 100 AND discount_pct BETWEEN 0 AND 100);
ALTER TABLE "categories"
  ADD CONSTRAINT "categories_not_own_parent" CHECK (parent_id IS DISTINCT FROM id);
ALTER TABLE "courses"
  ADD CONSTRAINT "courses_amounts" CHECK (price >= 0 AND seats > 0 AND duration_minutes BETWEEN 15 AND 720);
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_number_format" CHECK (number ~ '^RLX-[A-Z0-9]{5,8}$'),
  ADD CONSTRAINT "orders_email_lower" CHECK (contact_email = lower(contact_email)),
  ADD CONSTRAINT "orders_price" CHECK (
    price_base >= 0 AND discount BETWEEN 0 AND price_base
    AND total = price_base - discount AND discount_pct BETWEEN 0 AND 100
  ),
  ADD CONSTRAINT "orders_promo_has_teacher" CHECK ((promo_code IS NULL) = (teacher_id IS NULL)),
  ADD CONSTRAINT "orders_confirmed_at" CHECK (status <> 'confirmed' OR confirmed_at IS NOT NULL),
  ADD CONSTRAINT "orders_rejection_reason" CHECK (status <> 'rejected' OR rejection_reason IS NOT NULL);
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_size" CHECK (bytes BETWEEN 1 AND 4194304);
ALTER TABLE "commissions"
  ADD CONSTRAINT "commissions_range" CHECK (amount >= 0 AND pct BETWEEN 0 AND 100);
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_amount" CHECK (amount > 0);
ALTER TABLE "meetings"
  ADD CONSTRAINT "meetings_timeline" CHECK (
    (status = 'scheduled' AND started_at IS NULL AND ended_at IS NULL)
    OR (status = 'live' AND started_at IS NOT NULL AND ended_at IS NULL)
    OR (status = 'ended' AND started_at IS NOT NULL AND ended_at IS NOT NULL AND ended_at >= started_at)
  ),
  ADD CONSTRAINT "meetings_completed_after_end" CHECK (completed_at IS NULL OR status = 'ended');
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_email_lower" CHECK (email = lower(email));
ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_order" CHECK (left_at IS NULL OR left_at >= joined_at);
ALTER TABLE "certificates"
  ADD CONSTRAINT "certificates_code_format" CHECK (code ~ '^CERT-[A-Z0-9]{6,12}$');

-- A category can't be moved under one of its own sub-categories.
CREATE FUNCTION "prevent_category_cycle"() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL AND EXISTS (
    WITH RECURSIVE up AS (
      SELECT c.id, c.parent_id FROM public.categories c WHERE c.id = NEW.parent_id
      UNION
      SELECT c.id, c.parent_id FROM public.categories c JOIN up ON c.id = up.parent_id
    )
    SELECT 1 FROM up WHERE up.id = NEW.id
  ) THEN
    RAISE EXCEPTION 'category cycle' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "categories_no_cycle" BEFORE INSERT OR UPDATE OF parent_id ON "categories"
  FOR EACH ROW EXECUTE FUNCTION "prevent_category_cycle"();

-- The site reaches the database only through Prisma on the server. Supabase also exposes the
-- "public" schema over its Data API, so every table is closed to it: row-level security with
-- no policies, and no grants. A later migration that adds a table must enable RLS on it too.
DO $$
DECLARE
  item record;
  api_role text;
BEGIN
  FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', item.tablename);
  END LOOP;
  -- These roles exist on Supabase, not on a plain Postgres.
  FOR api_role IN SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated') LOOP
    EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', api_role);
    EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', api_role);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', api_role);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', api_role);
  END LOOP;
END $$;
