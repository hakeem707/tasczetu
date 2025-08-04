-- Create missing storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('provider-photos', 'provider-photos', true),
  ('provider-documents', 'provider-documents', true)
ON CONFLICT (id) DO NOTHING;