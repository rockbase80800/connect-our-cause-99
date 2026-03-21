
-- Function to lookup referrer name by referral code (bypasses RLS for unauthenticated signup)
CREATE OR REPLACE FUNCTION public.lookup_referral_code(_code text)
RETURNS TABLE(referrer_id uuid, referrer_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name FROM public.profiles WHERE referral_code = _code LIMIT 1;
$$;
