-- Fix function search path security issue
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  conversation_id UUID;
  p1_id UUID;
  p2_id UUID;
BEGIN
  -- Ensure sender_id is always participant_1_id (smaller UUID)
  IF NEW.sender_id < NEW.receiver_id THEN
    p1_id := NEW.sender_id;
    p2_id := NEW.receiver_id;
  ELSE
    p1_id := NEW.receiver_id;
    p2_id := NEW.sender_id;
  END IF;

  -- Update or create conversation
  INSERT INTO conversations (
    participant_1_id, 
    participant_2_id, 
    last_message_at, 
    last_message,
    related_booking_id
  )
  VALUES (
    p1_id,
    p2_id,
    NEW.created_at,
    LEFT(NEW.content, 100),
    NEW.related_booking_id
  )
  ON CONFLICT (participant_1_id, participant_2_id, related_booking_id)
  DO UPDATE SET
    last_message_at = NEW.created_at,
    last_message = LEFT(NEW.content, 100);

  RETURN NEW;
END;
$$;