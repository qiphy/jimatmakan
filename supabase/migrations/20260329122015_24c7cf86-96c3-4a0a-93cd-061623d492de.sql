
-- Recreate vendor_public_info view WITHOUT phone, WITH security_invoker
DROP VIEW IF EXISTS vendor_public_info;

CREATE VIEW vendor_public_info
  WITH (security_invoker = true) AS
  SELECT id, full_name, business_name, halal_verified, halal_status
  FROM profiles
  WHERE role = 'vendor';
