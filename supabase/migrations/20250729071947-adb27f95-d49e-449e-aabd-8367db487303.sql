-- Add user_id column to bookings table to link bookings to users
ALTER TABLE public.bookings 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update the RLS policy to be more specific about user ownership
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update the view policy to include user's own bookings
DROP POLICY IF EXISTS "Users can view bookings they created or received" ON public.bookings;

CREATE POLICY "Users can view their own bookings or provider bookings" 
ON public.bookings 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  provider_id IN (
    SELECT providers.id 
    FROM providers 
    WHERE providers.user_id = auth.uid()
  )
);