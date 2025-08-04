-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  related_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create conversations table to group messages
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  related_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE(participant_1_id, participant_2_id, related_booking_id)
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they sent or received" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Create policies for conversations
CREATE POLICY "Users can view their conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can update their conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Add indexes for better performance
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Enable realtime for messages and conversations
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Create function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update conversations
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Create trigger for updating message timestamps
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();