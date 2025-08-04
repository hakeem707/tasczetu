-- Add notification system for booking updates
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'booking', -- 'booking', 'system', 'payment', etc.
  related_booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true); -- Allow system to create notifications for any user

-- Add is_read column to bookings for tracking notification status
ALTER TABLE public.bookings 
ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;

-- Create function to automatically create notifications on booking status changes
CREATE OR REPLACE FUNCTION public.create_booking_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider_user_id UUID;
  client_message TEXT;
  provider_message TEXT;
BEGIN
  -- Get the provider's user_id
  SELECT user_id INTO provider_user_id 
  FROM providers 
  WHERE id = NEW.provider_id;

  -- Create notifications based on the status change
  IF TG_OP = 'INSERT' THEN
    -- New booking created - notify provider
    INSERT INTO notifications (user_id, title, message, type, related_booking_id)
    VALUES (
      provider_user_id,
      'New Booking Request',
      'You have received a new booking request from ' || NEW.client_name,
      'booking',
      NEW.id
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Status changed - notify both parties
    IF NEW.status = 'accepted' THEN
      client_message := 'Your booking request has been accepted by the provider.';
      provider_message := 'You have accepted the booking request from ' || NEW.client_name;
    ELSIF NEW.status = 'rejected' THEN
      client_message := 'Your booking request has been declined by the provider.';
      provider_message := 'You have declined the booking request from ' || NEW.client_name;
    ELSIF NEW.status = 'completed' THEN
      client_message := 'Your service has been completed. Please rate your experience.';
      provider_message := 'You have marked the service as completed for ' || NEW.client_name;
    END IF;

    -- Create notifications if messages exist
    IF client_message IS NOT NULL THEN
      -- Note: We'll need to get client user_id somehow or use a different approach
      -- For now, we'll focus on provider notifications
      INSERT INTO notifications (user_id, title, message, type, related_booking_id)
      VALUES (
        provider_user_id,
        'Booking Update',
        provider_message,
        'booking',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for booking notifications
CREATE TRIGGER booking_notification_trigger
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_booking_notification();

-- Add indices for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);