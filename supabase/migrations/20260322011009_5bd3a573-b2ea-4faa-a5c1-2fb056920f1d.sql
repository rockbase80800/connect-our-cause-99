
CREATE POLICY "Super admins can upload gallery images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Super admins can delete gallery images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'gallery-images' AND public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Public gallery images read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'gallery-images');
