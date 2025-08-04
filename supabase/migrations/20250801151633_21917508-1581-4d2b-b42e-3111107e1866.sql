-- Fix the search path for the delete_user_account function
DROP FUNCTION IF EXISTS public.delete_user_account();

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
BEGIN
  -- Delete user's data from any custom tables here if needed
  -- For now, just delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;