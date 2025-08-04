-- First, let's check if there are any existing users and assign admin role to the first one
-- This will ensure there's at least one admin user to access admin features

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users (if any exists)
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- If a user exists, make them an admin
    IF first_user_id IS NOT NULL THEN
        -- Check if they already have a role
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = first_user_id) THEN
            INSERT INTO public.user_roles (user_id, role)
            VALUES (first_user_id, 'admin');
        ELSE
            -- Update existing role to admin
            UPDATE public.user_roles 
            SET role = 'admin' 
            WHERE user_id = first_user_id;
        END IF;
    END IF;
END $$;