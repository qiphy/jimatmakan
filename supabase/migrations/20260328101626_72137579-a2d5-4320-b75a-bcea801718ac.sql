
-- Create a security definer function to check admin role without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'admin'::app_role
  );
$$;

-- Fix the recursive admin SELECT policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Also fix the admin UPDATE policy which has the same recursion issue
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
