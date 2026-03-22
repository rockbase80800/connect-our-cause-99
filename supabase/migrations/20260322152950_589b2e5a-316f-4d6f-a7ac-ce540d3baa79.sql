
CREATE POLICY "Authenticated users can upload payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-assets' AND (storage.foldername(name))[1] = 'payment-screenshots');
