
-- 1. Fix signup-time escalation: prevent 'admin' role from being set via user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, business_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('vendor', 'user', 'composter') 
      THEN (NEW.raw_user_meta_data->>'role')::app_role 
      ELSE 'user'::app_role 
    END,
    NEW.raw_user_meta_data->>'business_name'
  );
  RETURN NEW;
END;
$$;

-- 2. Fix post-signup escalation: prevent users from changing their own role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
);
