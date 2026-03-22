
-- 1. Create homepage_admins table
CREATE TABLE public.homepage_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  photo_url text,
  designation text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view homepage admins" ON public.homepage_admins FOR SELECT TO public USING (true);
CREATE POLICY "Super admins can manage homepage admins" ON public.homepage_admins FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 2. Add payment_status and user_status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_transaction_id text;
