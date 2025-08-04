-- Fix the delete_user_account function to properly clean up all user data
DROP FUNCTION IF EXISTS public.delete_user_account();

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
DECLARE
  user_uuid UUID;
  provider_uuid UUID;
BEGIN
  -- Get the current user ID
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;

  -- Get provider ID if user is a provider
  SELECT id INTO provider_uuid FROM providers WHERE user_id = user_uuid;

  -- Delete user's data in the correct order to avoid foreign key violations
  
  -- Delete portfolio items
  IF provider_uuid IS NOT NULL THEN
    DELETE FROM portfolios WHERE provider_id = provider_uuid;
  END IF;
  
  -- Delete skills
  IF provider_uuid IS NOT NULL THEN
    DELETE FROM skills WHERE provider_id = provider_uuid;
  END IF;
  
  -- Delete work experience
  IF provider_uuid IS NOT NULL THEN
    DELETE FROM work_experience WHERE provider_id = provider_uuid;
  END IF;
  
  -- Delete provider services
  IF provider_uuid IS NOT NULL THEN
    DELETE FROM provider_services WHERE provider_id = provider_uuid;
  END IF;
  
  -- Delete ratings given by the user
  DELETE FROM ratings WHERE user_id = user_uuid;
  
  -- Delete ratings for the provider (if they are a provider)
  IF provider_uuid IS NOT NULL THEN
    DELETE FROM ratings WHERE provider_id = provider_uuid;
  END IF;
  
  -- Delete notifications
  DELETE FROM notifications WHERE user_id = user_uuid;
  
  -- Delete messages sent or received by the user
  DELETE FROM messages WHERE sender_id = user_uuid OR receiver_id = user_uuid;
  
  -- Delete conversations where user is a participant
  DELETE FROM conversations 
  WHERE participant_1_id = user_uuid OR participant_2_id = user_uuid;
  
  -- Delete bookings made by the user
  DELETE FROM bookings WHERE user_id = user_uuid;
  
  -- Delete bookings for the provider (if they are a provider)
  IF provider_uuid IS NOT NULL THEN
    DELETE FROM bookings WHERE provider_id = provider_uuid;
  END IF;
  
  -- Delete the provider profile
  IF provider_uuid IS NOT NULL THEN
    DELETE FROM providers WHERE user_id = user_uuid;
  END IF;
  
  -- Finally, delete the user from auth.users
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;