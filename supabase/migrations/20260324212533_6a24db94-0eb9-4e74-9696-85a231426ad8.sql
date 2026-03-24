
-- Add halal_status column (pending, approved, rejected)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS halal_status text NOT NULL DEFAULT 'none';

-- Allow any authenticated user to read vendor profiles for admin page
-- (existing policy only allows reading own profile)
CREATE POLICY "Anyone can read vendor halal info"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'vendor');
