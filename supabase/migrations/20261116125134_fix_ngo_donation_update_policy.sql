/*
# Fix NGO donation-update policy to allow declining pending donations

1. What changed
- The `donations_update_ngo` UPDATE policy previously required that the new
  row keep `accepted_by` pointing at the NGO. Declining a pending donation
  clears `accepted_by` (sets it to NULL), which the old WITH CHECK blocked.
- The check now accepts rows where `accepted_by` is the NGO's id OR NULL,
  so an NGO can accept (set to its id) or decline (clear it).

2. Security
- No widening of access: still restricted to authenticated NGO users owning
  an NGO row; donors keep their own separate policy.
*/

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
      AND (donations.accepted_by = n.id OR donations.accepted_by IS NULL)
  )
);