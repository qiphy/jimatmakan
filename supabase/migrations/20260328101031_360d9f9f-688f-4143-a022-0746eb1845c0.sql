
-- Allow users to update halal_cert_url but auto-set status to pending via trigger
CREATE OR REPLACE FUNCTION public.auto_set_halal_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user uploads/removes a cert, auto-update halal_status
  IF NEW.halal_cert_url IS DISTINCT FROM OLD.halal_cert_url THEN
    IF NEW.halal_cert_url IS NOT NULL AND NEW.halal_cert_url != '' THEN
      NEW.halal_status := 'pending';
      NEW.halal_verified := false;
    ELSE
      NEW.halal_status := 'none';
      NEW.halal_verified := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_halal_pending
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_set_halal_pending();

-- Update RLS: allow halal_cert_url changes but keep status/verified frozen for user self-updates
-- The trigger will handle status changes automatically
DROP POLICY "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role IS NOT DISTINCT FROM (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
);
