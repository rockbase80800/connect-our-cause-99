
CREATE TABLE public.homepage_about_card (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text DEFAULT 'About Our Mission',
  description text DEFAULT 'Empowering communities through sustainable development.',
  about_text text DEFAULT 'We work at the grassroots level to bring real change.',
  images jsonb DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_about_card ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read about card" ON public.homepage_about_card FOR SELECT TO public USING (true);
CREATE POLICY "Super admins can manage about card" ON public.homepage_about_card FOR ALL TO public USING (public.has_role(auth.uid(), 'super_admin'::app_role));
