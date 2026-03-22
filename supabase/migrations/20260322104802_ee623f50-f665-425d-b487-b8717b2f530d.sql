
-- Wallet table for tracking earnings
CREATE TABLE public.wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;

-- Super admin can manage all wallets
CREATE POLICY "Super admins can manage wallets"
  ON public.wallet FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Users can view own wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallet FOR SELECT
  USING (auth.uid() = user_id);

-- Websites table
CREATE TABLE public.websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Anyone can view websites
CREATE POLICY "Anyone can view websites"
  ON public.websites FOR SELECT
  USING (true);

-- Super admins can manage websites
CREATE POLICY "Super admins can manage websites"
  ON public.websites FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));
