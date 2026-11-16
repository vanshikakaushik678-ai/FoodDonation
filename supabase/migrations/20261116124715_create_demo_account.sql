/*
# Create demo donor account

1. What this does
- Creates one demo auth user (id fixed to a stable uuid):
  email: demo.donor@foodconnect.demo, password: demo123456
  with a matching 'donor' profile row (name: Demo Donor).
- The password hash uses pgcrypto bcrypt (crypt + gen_salt('bf')), the same
  algorithm Supabase Auth (GoTrue) verifies against, so sign-in works.
- Used only for quick demos/examiner walkthroughs.

2. Safety
- Idempotent: ON CONFLICT DO NOTHING on both the auth user and profile.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at,
  updated_at, raw_app_meta_data, raw_user_meta_data
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo.donor@foodconnect.demo',
  crypt('demo123456', gen_salt('bf', 10)),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Demo Donor","role":"donor"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, full_name, phone, city)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'donor',
  'Demo Donor',
  '+91 90000 00000',
  'Bengaluru'
)
ON CONFLICT (id) DO NOTHING;

UPDATE auth.users
SET email_confirmed_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111'
  AND email_confirmed_at IS NULL;