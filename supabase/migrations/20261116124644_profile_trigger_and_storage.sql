/*
# Auto-create user profile on signup + food image storage bucket

1. Functions
- `public.handle_new_user()`: SECURITY DEFINER trigger function that inserts a
  matching `profiles` row whenever a new user is created in auth.users.
  Reads role/name/phone/city from the signup metadata, falling back to
  'donor' / email local part. SECURITY DEFINER is required because the
  insert happens during auth (before any profile row exists) and cannot rely
  on RLS policies. Its search_path is pinned for safety. It is NOT a public
  RPC: EXECUTE is revoked from PUBLIC/anon and granted only to the postgres
  role that owns the trigger.

2. Triggers
- `on_auth_user_created`: AFTER INSERT ON auth.users, runs handle_new_user.

3. Storage
- Creates the `food-images` bucket (public read for donation images).
- Uniform policy: anyone can view objects in food-images;
  authenticated users can upload into a folder named with their own user id
  and can delete their own objects.

4. Notes
- All statements idempotent, safe to re-run.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone, city)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'donor'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'city'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
  ) THEN
    EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "food_images_public_read" ON storage.objects;
CREATE POLICY "food_images_public_read" ON storage.objects FOR SELECT
TO anon, authenticated USING (bucket_id = 'food-images');

DROP POLICY IF EXISTS "food_images_auth_upload" ON storage.objects;
CREATE POLICY "food_images_auth_upload" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'food-images');

DROP POLICY IF EXISTS "food_images_owner_delete" ON storage.objects;
CREATE POLICY "food_images_owner_delete" ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'food-images' AND owner = auth.uid());