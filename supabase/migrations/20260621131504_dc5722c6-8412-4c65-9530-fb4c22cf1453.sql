CREATE POLICY "Admins read tiktok media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tiktok-media' AND public.has_role(auth.uid(), 'admin'));