-- Fix the foreign key constraints in conversations table
-- The table is trying to reference a 'users' table that doesn't exist
-- Since we're using Supabase auth, we need to remove these constraints
-- and rely on application-level validation instead

-- Drop the existing foreign key constraints
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant_1_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_participant_2_id_fkey;