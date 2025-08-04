-- Fix storage policies for provider-photos bucket
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'provider-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'provider-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'provider-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'provider-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix storage policies for provider-documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'provider-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix providers table policy
DROP POLICY IF EXISTS "Users can create their own provider profile" ON public.providers;

CREATE POLICY "Users can create their own provider profile"
ON public.providers
FOR INSERT
WITH CHECK (auth.uid() = user_id);