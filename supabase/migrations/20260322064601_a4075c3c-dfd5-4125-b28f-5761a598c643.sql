
-- Add payment columns to applications
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS transaction_id text;

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id text PRIMARY KEY DEFAULT 'global-payment',
  qr_image_url text,
  instructions text DEFAULT 'कृपया नीचे दिए गए QR कोड को स्कैन करके भुगतान करें और Transaction ID दर्ज करें।',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payment settings" ON public.payment_settings FOR SELECT TO public USING (true);
CREATE POLICY "Super admins can manage payment settings" ON public.payment_settings FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default row
INSERT INTO public.payment_settings (id) VALUES ('global-payment') ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for payment QR images
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-assets', 'payment-assets', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment-assets
CREATE POLICY "Anyone can view payment assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'payment-assets');
CREATE POLICY "Super admins can manage payment assets" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'payment-assets' AND has_role(auth.uid(), 'super_admin'::app_role));
