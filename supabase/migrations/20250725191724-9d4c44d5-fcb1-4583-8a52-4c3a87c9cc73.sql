-- Add verification fields to providers table
ALTER TABLE public.providers 
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN id_document_url TEXT,
ADD COLUMN certifications TEXT[];

-- Create portfolio table for provider work samples
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Portfolio policies
CREATE POLICY "Anyone can view portfolios" 
ON public.portfolios 
FOR SELECT 
USING (true);

CREATE POLICY "Provider owners can manage their portfolios" 
ON public.portfolios 
FOR ALL 
USING (provider_id IN (
  SELECT id FROM providers WHERE user_id = auth.uid()
));

-- Update ratings table to include review text
ALTER TABLE public.ratings 
ADD COLUMN review_text TEXT,
ADD COLUMN work_quality INTEGER CHECK (work_quality >= 1 AND work_quality <= 5),
ADD COLUMN punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
ADD COLUMN communication INTEGER CHECK (communication >= 1 AND communication <= 5);

-- Function to update provider verification status
CREATE OR REPLACE FUNCTION public.update_provider_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-verify if provider has ID document and certifications
  IF NEW.id_document_url IS NOT NULL AND array_length(NEW.certifications, 1) > 0 THEN
    NEW.is_verified = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-verification
CREATE TRIGGER auto_verify_provider
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_verification();