-- Create edge function for account deletion
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user's data from any custom tables here if needed
  -- For now, just delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;