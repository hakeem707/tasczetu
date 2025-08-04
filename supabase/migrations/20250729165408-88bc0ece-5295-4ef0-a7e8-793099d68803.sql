-- Create storage policies for provider-files bucket
CREATE POLICY "Users can upload their own provider files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'provider-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own provider files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'provider-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own provider files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'provider-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own provider files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'provider-files' AND auth.uid()::text = (storage.foldername(name))[1]);