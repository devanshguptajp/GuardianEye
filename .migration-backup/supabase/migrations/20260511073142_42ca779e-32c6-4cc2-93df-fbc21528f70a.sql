-- 1. Add server-side subscription tier
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'basic'
    CHECK (subscription_tier IN ('basic','premium'));

-- Block non-service-role users from changing their own subscription tier
CREATE OR REPLACE FUNCTION public.protect_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
     AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'subscription_tier can only be changed by billing system';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_subscription_tier_trg ON public.profiles;
CREATE TRIGGER protect_subscription_tier_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_tier();

-- 2. Lock down SECURITY DEFINER helpers from direct execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_subscription_tier() FROM PUBLIC, anon, authenticated;

-- 3. Realtime channel authorization: users can only join topics that include their auth.uid()
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ge_realtime_user_scoped_read" ON realtime.messages;
CREATE POLICY "ge_realtime_user_scoped_read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);

DROP POLICY IF EXISTS "ge_realtime_user_scoped_write" ON realtime.messages;
CREATE POLICY "ge_realtime_user_scoped_write"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);
