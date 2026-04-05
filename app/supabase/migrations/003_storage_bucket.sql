-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Allow public read
CREATE POLICY "Public can read media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');

-- Allow owners to delete
CREATE POLICY "Users can delete own media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add unique constraint for social_accounts platform for upsert
ALTER TABLE social_accounts ADD CONSTRAINT social_accounts_platform_key UNIQUE (platform);
