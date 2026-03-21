
-- Fix: Remove overly permissive notification insert policy
DROP POLICY "System can insert notifications" ON public.notifications;

-- Fix: Set search_path on functions that are missing it
ALTER FUNCTION public.generate_referral_code() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.notify_application_status() SET search_path = public;
ALTER FUNCTION public.notify_new_application() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
