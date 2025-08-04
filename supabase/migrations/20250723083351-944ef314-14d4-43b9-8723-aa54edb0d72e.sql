-- Create services table first (referenced by other tables)
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create providers table
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  phone TEXT,
  location TEXT,
  service_category TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create provider_services junction table
CREATE TABLE public.provider_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, service_id)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

-- Insert default services
INSERT INTO public.services (name, description) VALUES
('Cleaning', 'Home and office cleaning services'),
('Plumbing', 'Plumbing repair and installation'),
('Electrical', 'Electrical repair and installation'),
('Gardening', 'Garden maintenance and landscaping'),
('Painting', 'Interior and exterior painting'),
('Carpentry', 'Furniture and woodwork services'),
('Moving', 'Moving and relocation services'),
('Tutoring', 'Educational tutoring services');

-- Enable RLS on all tables
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for providers table
CREATE POLICY "Users can view all providers" 
ON public.providers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own provider profile" 
ON public.providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provider profile" 
ON public.providers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provider profile" 
ON public.providers 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for provider_services table
CREATE POLICY "Anyone can view provider services" 
ON public.provider_services 
FOR SELECT 
USING (true);

CREATE POLICY "Provider owners can manage their services" 
ON public.provider_services 
FOR ALL 
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  )
);

-- RLS Policies for bookings table
CREATE POLICY "Users can view bookings they created or received" 
ON public.bookings 
FOR SELECT 
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Provider owners can update booking status" 
ON public.bookings 
FOR UPDATE 
USING (
  provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  )
);

-- RLS Policies for ratings table
CREATE POLICY "Anyone can view ratings" 
ON public.ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create ratings" 
ON public.ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for services table (read-only for most users)
CREATE POLICY "Anyone can view services" 
ON public.services 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();