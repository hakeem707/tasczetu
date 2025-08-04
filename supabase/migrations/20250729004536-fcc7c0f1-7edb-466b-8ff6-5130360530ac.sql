-- Create storage buckets for provider files
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-photos', 'provider-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('provider-documents', 'provider-documents', false);

-- Create storage policies for provider photos (public)
CREATE POLICY "Provider photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'provider-photos');

CREATE POLICY "Users can upload their own provider photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'provider-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own provider photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'provider-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own provider photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'provider-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for provider documents (private)
CREATE POLICY "Users can view their own provider documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own provider documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own provider documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own provider documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'provider-documents' AND auth.uid()::text = (storage.foldername(name))[1]);