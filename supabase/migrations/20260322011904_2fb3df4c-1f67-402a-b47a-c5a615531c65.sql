
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url text NOT NULL,
  youtube_id text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active videos" ON public.videos
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Super admins can manage videos" ON public.videos
  FOR ALL TO public USING (has_role(auth.uid(), 'super_admin'::app_role));
