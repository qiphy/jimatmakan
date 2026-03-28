
-- Fix 1: Prevent users from self-approving halal status
DROP POLICY "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role IS NOT DISTINCT FROM (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  AND halal_status IS NOT DISTINCT FROM (SELECT p.halal_status FROM profiles p WHERE p.id = auth.uid())
  AND halal_verified IS NOT DISTINCT FROM (SELECT p.halal_verified FROM profiles p WHERE p.id = auth.uid())
);

-- Fix 2: Replace broad vendor SELECT policy with restricted view
DROP POLICY "Anyone can read vendor halal info" ON public.profiles;

-- Add admin read-all policy so AdminHalalPage still works
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'::app_role
  )
);

-- Create a view with only safe vendor fields for non-admin queries
CREATE VIEW public.vendor_public_info AS
  SELECT id, full_name, business_name, halal_status, halal_verified, phone
  FROM public.profiles
  WHERE role = 'vendor'::app_role;

ALTER VIEW public.vendor_public_info OWNER TO postgres;
GRANT SELECT ON public.vendor_public_info TO authenticated;
