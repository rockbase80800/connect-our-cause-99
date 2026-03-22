
-- Add own_page to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'own_page';

-- Create user_profiles table for personal pages
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  photo_url text,
  bio text,
  description text,
  contact text,
  designation text,
  show_in_slider boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved profiles
CREATE POLICY "Anyone can view approved profiles"
ON public.user_profiles FOR SELECT
TO public
USING (status = 'approved');

-- Users can manage own profile
CREATE POLICY "Users can manage own profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Super admins can do everything
CREATE POLICY "Super admins can manage all user profiles"
ON public.user_profiles FOR ALL
TO public
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can view all
CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::app_role));
