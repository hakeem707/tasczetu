-- Add foreign key relationships to enable proper joins between conversations and messages

-- Add foreign key from messages to conversations
-- First, we need to determine how to link messages to conversations
-- Messages should reference a conversation based on participant IDs and booking

-- Create a function to get or create conversation ID
CREATE OR REPLACE FUNCTION public.get_conversation_id(
  sender_user_id UUID,
  receiver_user_id UUID,
  booking_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  conv_id UUID;
  p1_id UUID;
  p2_id UUID;
BEGIN
  -- Ensure consistent ordering of participant IDs
  IF sender_user_id < receiver_user_id THEN
    p1_id := sender_user_id;
    p2_id := receiver_user_id;
  ELSE
    p1_id := receiver_user_id;
    p2_id := sender_user_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM conversations
  WHERE participant_1_id = p1_id 
    AND participant_2_id = p2_id 
    AND (related_booking_id = booking_id OR (related_booking_id IS NULL AND booking_id IS NULL));

  -- If not found, create new conversation
  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_1_id, participant_2_id, related_booking_id)
    VALUES (p1_id, p2_id, booking_id)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add conversation_id column to messages table
ALTER TABLE public.messages 
ADD COLUMN conversation_id UUID;

-- Update existing messages to set conversation_id
UPDATE public.messages 
SET conversation_id = public.get_conversation_id(sender_id, receiver_id, related_booking_id);

-- Make conversation_id NOT NULL after updating existing records
ALTER TABLE public.messages 
ALTER COLUMN conversation_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Update the trigger to set conversation_id when inserting new messages
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Get or create conversation ID
  conv_id := public.get_conversation_id(NEW.sender_id, NEW.receiver_id, NEW.related_booking_id);
  NEW.conversation_id := conv_id;

  -- Update conversation with latest message info
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message = LEFT(NEW.content, 100)
  WHERE id = conv_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for messages
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_on_message
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();