
-- Create website_settings table (single-row global config)
CREATE TABLE public.website_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'JanSeva',
  logo_url text,
  favicon_url text,
  description text DEFAULT 'Empowering communities through service and collaboration',
  header_content jsonb DEFAULT '{}',
  footer_content jsonb DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for global UI)
CREATE POLICY "Anyone can read website settings"
ON public.website_settings FOR SELECT USING (true);

-- Only super_admin can update
CREATE POLICY "Super admins can update website settings"
ON public.website_settings FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin'));

-- Only super_admin can insert (for initial setup)
CREATE POLICY "Super admins can insert website settings"
ON public.website_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Insert default row
INSERT INTO public.website_settings (site_name, description, header_content, footer_content)
VALUES (
  'JanSeva',
  'Empowering communities through service and collaboration',
  '{"links": []}',
  '{"copyright": "© 2026 JanSeva. All rights reserved.", "links": []}'
);

-- Create storage bucket for website assets
INSERT INTO storage.buckets (id, name, public) VALUES ('website-assets', 'website-assets', true);

-- Public read access
CREATE POLICY "Public read access for website assets"
ON storage.objects FOR SELECT USING (bucket_id = 'website-assets');

-- Super admin upload
CREATE POLICY "Super admins can upload website assets"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'website-assets' AND public.has_role(auth.uid(), 'super_admin')
);

-- Super admin update
CREATE POLICY "Super admins can update website assets"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'website-assets' AND public.has_role(auth.uid(), 'super_admin')
);

-- Super admin delete
CREATE POLICY "Super admins can delete website assets"
ON storage.objects FOR DELETE USING (
  bucket_id = 'website-assets' AND public.has_role(auth.uid(), 'super_admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_website_settings_updated_at
BEFORE UPDATE ON public.website_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
