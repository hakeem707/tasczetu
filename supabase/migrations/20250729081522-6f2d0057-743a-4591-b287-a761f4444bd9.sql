-- Fix the foreign key constraints in messages table
-- The table is trying to reference a 'users' table that doesn't exist
-- Since we're using Supabase auth, we need to remove these constraints
-- and rely on application-level validation instead

-- Drop the existing foreign key constraints on messages table
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;