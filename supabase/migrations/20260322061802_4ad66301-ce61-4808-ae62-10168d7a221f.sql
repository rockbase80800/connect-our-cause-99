
INSERT INTO public.website_settings (id, site_name, description, logo_url, favicon_url, header_content, footer_content)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Meri Pahal Fast Help',
  'Meri Pahal Fast Help Artists Welfare Association (Trust) — Empowering communities through sustainable development, education, and healthcare initiatives.',
  NULL, NULL, '{}'::jsonb, '{}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.homepage_settings (id, hero_title, hero_subtext, hero_eyebrow, button_text, button_link, button2_text, button2_link)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Building Stronger
Communities Together',
  'We work at the grassroots level — from panchayats to districts — to bring sustainable change through education, healthcare, and clean water initiatives.',
  'Empowering Communities Since 2018',
  'Join Our Mission', '/auth', 'View Projects', '#projects'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.about_settings (id, eyebrow, title, description, description2)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'About Us',
  'Meri Pahal Fast Help Artists Welfare Association (Trust)',
  'We are committed to empowering rural communities through sustainable development programs, women''s health awareness, free sanitary pad distribution, and healthcare initiatives across India.',
  'Our network of dedicated coordinators and volunteers works at the grassroots level — from panchayats to districts — to bring real, measurable change.'
)
ON CONFLICT (id) DO NOTHING;
