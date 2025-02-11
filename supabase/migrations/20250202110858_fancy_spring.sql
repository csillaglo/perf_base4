-- First, delete any existing superadmin
DO $$ 
BEGIN
  -- Delete from auth.users (this will cascade to profiles due to foreign key)
  DELETE FROM auth.users 
  WHERE email = 'superadmin@performancepro.com';
END $$;

-- Create new superadmin user with proper password hashing
DO $$ 
DECLARE 
    new_user_id uuid;
BEGIN
    -- Generate UUID for new user
    new_user_id := uuid_generate_v4();
    
    -- Create auth user with properly hashed password
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        role,
        aud,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change_token_current
    ) VALUES (
        new_user_id,
        'superadmin@performancepro.com',
        crypt('superadmin123', gen_salt('bf', 10)), -- Use proper bcrypt hashing
        now(),
        'authenticated',
        'authenticated',
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "System Superadmin"}'::jsonb,
        true,
        encode(gen_random_bytes(32), 'base64'),
        encode(gen_random_bytes(32), 'base64'),
        encode(gen_random_bytes(32), 'base64'),
        encode(gen_random_bytes(32), 'base64')
    );

    -- Create profile for superadmin
    INSERT INTO public.profiles (
        id,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'System Superadmin',
        'superadmin',
        now(),
        now()
    );

    -- Ensure the user is confirmed and active
    UPDATE auth.users 
    SET 
        email_confirmed_at = now(),
        last_sign_in_at = now(),
        confirmation_sent_at = now(),
        email_change_confirm_status = 0,
        is_sso_user = false,
        banned_until = null,
        deleted_at = null
    WHERE id = new_user_id;
END $$;