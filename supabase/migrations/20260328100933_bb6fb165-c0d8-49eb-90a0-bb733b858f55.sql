
-- Fix SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.vendor_public_info;
CREATE VIEW public.vendor_public_info
WITH (security_invoker = true) AS
  SELECT id, full_name, business_name, halal_status, halal_verified, phone
  FROM public.profiles
  WHERE role = 'vendor'::app_role;

GRANT SELECT ON public.vendor_public_info TO authenticated;
