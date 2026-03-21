
-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners" ON public.banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage banners" ON public.banners
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Create project-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);

CREATE POLICY "Anyone can view project images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Super admins can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update project images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete project images" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'super_admin'));

-- Create banner-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true);

CREATE POLICY "Anyone can view banner images" ON storage.objects
  FOR SELECT USING (bucket_id = 'banner-images');

CREATE POLICY "Super admins can upload banner images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banner-images' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete banner images" ON storage.objects
  FOR DELETE USING (bucket_id = 'banner-images' AND public.has_role(auth.uid(), 'super_admin'));
