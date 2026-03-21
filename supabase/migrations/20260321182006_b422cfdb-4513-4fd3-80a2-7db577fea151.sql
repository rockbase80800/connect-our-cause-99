
-- Project images table for gallery
CREATE TABLE public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view project images" ON public.project_images FOR SELECT TO public USING (true);
CREATE POLICY "Super admins can manage project images" ON public.project_images FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'));

-- Homepage settings table
CREATE TABLE public.homepage_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'Building Stronger Communities Together',
  hero_subtext text DEFAULT 'We work at the grassroots level — from panchayats to districts — to bring sustainable change through education, healthcare, and clean water initiatives.',
  hero_bg text,
  hero_eyebrow text DEFAULT 'Empowering Communities Since 2018',
  button_text text DEFAULT 'Join Our Mission',
  button_link text DEFAULT '/auth',
  button2_text text DEFAULT 'View Projects',
  button2_link text DEFAULT '#projects',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read homepage settings" ON public.homepage_settings FOR SELECT TO public USING (true);
CREATE POLICY "Super admins can manage homepage settings" ON public.homepage_settings FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'));

INSERT INTO public.homepage_settings (hero_title) VALUES ('Building Stronger Communities Together');

-- About settings table
CREATE TABLE public.about_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT 'Grassroots Development, Real Results',
  eyebrow text DEFAULT 'About JanSeva',
  description text DEFAULT 'JanSeva is a non-governmental organization committed to empowering rural communities through sustainable development programs.',
  description2 text DEFAULT 'Founded in 2018, we''ve grown from a single district operation to a multi-district network of dedicated coordinators and volunteers.',
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read about settings" ON public.about_settings FOR SELECT TO public USING (true);
CREATE POLICY "Super admins can manage about settings" ON public.about_settings FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'));

INSERT INTO public.about_settings (title) VALUES ('Grassroots Development, Real Results');

-- Gallery table
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gallery" ON public.gallery FOR SELECT TO public USING (true);
CREATE POLICY "Super admins can manage gallery" ON public.gallery FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'));

-- Leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  form_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can manage leads" ON public.leads FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT TO public WITH CHECK (true);

-- Storage bucket for gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);
