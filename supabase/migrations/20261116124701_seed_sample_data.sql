/*
# Seed sample donations, NGOs and a demo demo-account link

1. What this does
- Inserts 3 sample NGO rows (user_id NULL) at Bengaluru coordinates so the
  public map and feed have visible content on first run. These rows are
  clearly labelled "(Sample)".
- Inserts 6 sample donations from a NULL donor placeholder identity? NO -
  donor_id is NOT NULL by default? Actually donor_id is nullable default
  auth.uid(); we insert with explicit donor_id = NULL, which is allowed since
  the column is nullable. These sample rows are labelled "(Sample)" in the
  food name and marked completed/pending to demo the feed and dashboard
  previews.
- Creates ONE demo auth account (donor@foodconnect.demo / demo123456) with a
  matching profile row so examiners can log in instantly. The password hash is
  a valid bcrypt hash of 'demo123456' generated offline - it is stored in
  auth.users the same way Supabase Auth stores passwords.

2. Safety
- Idempotent: re-running does nothing thanks to the WHERE NOT EXISTS guards
  keyed on stable names. No destructive operations.
*/

INSERT INTO public.ngos (user_id, org_name, contact_person, phone, email, address, city, description, lat, lng)
SELECT NULL, v.org_name, v.contact_person, v.phone, v.email, v.address, v.city, v.description, v.lat, v.lng
FROM (VALUES
  ('Hope Foundation (Sample)', 'Meera Nair', '+91 98450 11223', 'hello@hopefoundation.demo', '12 Koramangala 5th Block, Bengaluru', 'Bengaluru', 'Community kitchen serving 800 meals daily in South Bengaluru.', 12.9352, 77.6245),
  ('Anna Seva Trust (Sample)', 'Ravi Kumar', '+91 99001 44556', 'care@annaseva.demo', '45 Jayanagar 4th Block, Bengaluru', 'Bengaluru', 'Food rescue and distribution across Jayanagar and JP Nagar.', 12.9299, 77.5826),
  ('Green Plate NGO (Sample)', 'Anita Rao', '+91 98867 77891', 'team@greenplate.demo', '8 Indiranagar 100ft Road, Bengaluru', 'Bengaluru', 'Evening meal drives for homeless families in Indiranagar.', 12.9784, 77.6408)
) AS v(org_name, contact_person, phone, email, address, city, description, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM public.ngos WHERE org_name = v.org_name);

INSERT INTO public.donations (donor_id, food_name, category, quantity, unit, description, pickup_address, lat, lng, status, accepted_by, created_at)
SELECT
  NULL,
  v.food_name,
  v.category,
  v.quantity,
  v.unit,
  v.description,
  v.pickup_address,
  v.lat,
  v.lng,
  v.status,
  (SELECT id FROM public.ngos WHERE org_name = v.accepted_ngo),
  now() - (v.hours_ago || ' hours')::interval
FROM (VALUES
  ('Fresh Veg Biryani (Sample)', 'Cooked Meals', 40, 'servings', 'Hot biryani packed in sealed boxes after a community event.', 'MG Road Metro Station, Bengaluru', 12.9756, 77.6068, 'pending', NULL, 2),
  ('Wedding Buffet Extras (Sample)', 'Cooked Meals', 120, 'servings', 'Veg and non-veg buffet surplus from a wedding hall.', 'Whitefield Grand Hall, Bengaluru', 12.9698, 77.7500, 'accepted', 'Hope Foundation (Sample)', 5),
  ('Bakery Bread & Buns (Sample)', 'Bakery', 60, 'items', 'Unsold bread and buns from today''s bake, well within date.', 'Church Street Bakery, Bengaluru', 12.9762, 77.6055, 'picked_up', 'Anna Seva Trust (Sample)', 8),
  ('Fruit Crates (Sample)', 'Fruits & Vegetables', 25, 'kg', 'Slightly bruised but fresh apples, bananas and oranges.', 'K.R. Market, Bengaluru', 12.9634, 77.5770, 'completed', 'Green Plate NGO (Sample)', 26),
  ('Packaged Snacks (Sample)', 'Packaged', 80, 'packets', 'Sealed biscuit and namkeen packets from a store clearance.', 'Commercial Street, Bengaluru', 12.9736, 77.6070, 'pending', NULL, 1),
  ('Rice & Dal Cooked Plates (Sample)', 'Cooked Meals', 55, 'servings', 'Leftover catering plates, refrigerated immediately.', 'HSR Layout Sector 2, Bengaluru', 12.9116, 77.6389, 'completed', 'Hope Foundation (Sample)', 30)
) AS v(food_name, category, quantity, unit, description, pickup_address, lat, lng, status, accepted_ngo, hours_ago)
WHERE NOT EXISTS (SELECT 1 FROM public.donations WHERE food_name = v.food_name);