/*
# Lock down the signup profile trigger function

1. Security change
- `public.handle_new_user()` is an internal SECURITY DEFINER trigger function.
- It runs automatically when Supabase Auth creates a user and is not intended
  to be called through the public Data API.
- Revoke EXECUTE from the authenticated role as well as PUBLIC and anon.
- Keep EXECUTE only for the trigger-owning postgres role and service_role.

2. Data safety
- No tables or records are changed.
- Signup behavior is unchanged because the trigger itself retains permission
  to execute the function.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;