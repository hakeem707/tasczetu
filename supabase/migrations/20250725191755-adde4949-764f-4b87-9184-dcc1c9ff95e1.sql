-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_provider_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-verify if provider has ID document and certifications
  IF NEW.id_document_url IS NOT NULL AND array_length(NEW.certifications, 1) > 0 THEN
    NEW.is_verified = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public';