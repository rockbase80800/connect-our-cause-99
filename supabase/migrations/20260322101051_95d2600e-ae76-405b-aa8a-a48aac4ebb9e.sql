
-- Create legal_documents table
CREATE TABLE public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_url text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Anyone can view
CREATE POLICY "Anyone can view legal documents"
  ON public.legal_documents FOR SELECT
  TO public
  USING (true);

-- Super admins can manage
CREATE POLICY "Super admins can manage legal documents"
  ON public.legal_documents FOR ALL
  TO public
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('legal-docs', 'legal-docs', true);

-- Storage policies
CREATE POLICY "Anyone can view legal docs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'legal-docs');

CREATE POLICY "Super admins can upload legal docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'legal-docs' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete legal docs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'legal-docs' AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update legal docs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'legal-docs' AND public.has_role(auth.uid(), 'super_admin'));
