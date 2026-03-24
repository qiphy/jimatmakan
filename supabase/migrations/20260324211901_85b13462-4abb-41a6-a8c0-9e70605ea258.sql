
-- Add halal certificate URL column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS halal_cert_url text;

-- Create storage bucket for halal certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('halal-certificates', 'halal-certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to halal-certificates bucket
CREATE POLICY "Users can upload halal certs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'halal-certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
CREATE POLICY "Public can view halal certs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'halal-certificates');

-- Allow users to delete their own certs
CREATE POLICY "Users can delete own halal certs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'halal-certificates' AND (storage.foldername(name))[1] = auth.uid()::text);
