/*
# FOOD CONNECT core schema: profiles, NGOs, donations, contact messages

1. New Tables
- `profiles`: one row per user account. `id` matches the auth user id, `role`
  is either 'donor' or 'ngo', plus name / phone / city details.
- `ngos`: NGO organization profiles. Linked to the owning auth user via
  `user_id` (nullable so clearly-labelled sample NGO rows can exist for the map
  preview). Stores org name, contact details, address, city, description and
  map coordinates.
- `donations`: food donation records created by donors. Food details (name,
  category, quantity, unit, description, image), pickup location (address +
  lat/lng), availability window, status lifecycle
  (pending -> accepted -> picked_up -> completed, or rejected), and which NGO
  accepted it (`accepted_by`). `donor_id` defaults to the authenticated user.
- `contact_messages`: messages sent through the public Contact Us form.

2. Indexes
- donations(status, created_at), donations(donor_id), donations(accepted_by)
- ngos(city)

3. Security
- RLS enabled on every table.
- profiles: authenticated users read/update/insert only their own row.
- ngos: publicly readable (needed to show NGO locations on the public map);
  insert/update restricted to the owning authenticated NGO user.
- donations: publicly readable (the Live Donation Feed is public); insert only
  by the authenticated donor who owns the row; update by the owning donor OR
  by the NGO that owns the accepted request.
- contact_messages: anyone can insert (public contact form); only
  authenticated role is granted select but there is no select policy, so
  messages stay private (readable only server-side / by admins).
- Explicit GRANTs limited to the roles and verbs each table needs.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'ngo')),
  full_name text NOT NULL,
  phone text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  org_name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  description text,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  food_name text NOT NULL,
  category text NOT NULL,
  quantity double precision NOT NULL,
  unit text NOT NULL DEFAULT 'servings',
  description text,
  image_url text,
  pickup_address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  available_from timestamptz,
  available_until timestamptz,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'picked_up', 'completed', 'rejected')),
  accepted_by uuid REFERENCES public.ngos(id),
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donations_status_created_idx ON public.donations (status, created_at DESC);
CREATE INDEX IF NOT EXISTS donations_donor_idx ON public.donations (donor_id);
CREATE INDEX IF NOT EXISTS donations_accepted_idx ON public.donations (accepted_by);
CREATE INDEX IF NOT EXISTS ngos_city_idx ON public.ngos (city);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.ngos TO anon, authenticated;
GRANT INSERT, UPDATE ON public.ngos TO authenticated;
GRANT SELECT ON public.donations TO anon, authenticated;
GRANT INSERT, UPDATE ON public.donations TO authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;

-- profiles: strictly owner-scoped
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ngos: public read, owner-scoped writes
DROP POLICY IF EXISTS "ngos_public_read" ON public.ngos;
CREATE POLICY "ngos_public_read" ON public.ngos FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "ngos_insert_own" ON public.ngos;
CREATE POLICY "ngos_insert_own" ON public.ngos FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ngos_update_own" ON public.ngos;
CREATE POLICY "ngos_update_own" ON public.ngos FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- donations: public read (live feed), donor-owned insert/update,
-- NGO can update rows it created an acceptance on
DROP POLICY IF EXISTS "donations_public_read" ON public.donations;
CREATE POLICY "donations_public_read" ON public.donations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "donations_insert_own" ON public.donations;
CREATE POLICY "donations_insert_own" ON public.donations FOR INSERT
TO authenticated WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "donations_update_donor" ON public.donations;
CREATE POLICY "donations_update_donor" ON public.donations FOR UPDATE
TO authenticated
USING (auth.uid() = donor_id)
WITH CHECK (auth.uid() = donor_id);

DROP POLICY IF EXISTS "donations_update_ngo" ON public.donations;
CREATE POLICY "donations_update_ngo" ON public.donations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ngos n
    WHERE n.user_id = auth.uid()
      AND (donations.accepted_by = n.id OR donations.accepted_by IS NULL)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ngos n
    WHERE n.user_id = auth.uid()
      AND donations.accepted_by = n.id
  )
);

-- contact messages: insert-only for everyone
DROP POLICY IF EXISTS "contact_insert_anyone" ON public.contact_messages;
CREATE POLICY "contact_insert_anyone" ON public.contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);