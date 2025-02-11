-- First, delete the existing superadmin
DO $$ 
BEGIN
  -- Delete from auth.users (this will cascade to profiles due to foreign key)
  DELETE FROM auth.users 
  WHERE email = 'superadmin@performancepro.com';
END $$;

-- Create new superadmin user
DO $$ 
DECLARE 
    new_user_id uuid;
BEGIN
    -- Generate UUID for new user
    new_user_id := uuid_generate_v4();
    
    -- Create auth user
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
        is_super_admin
    ) VALUES (
        new_user_id,
        'superadmin@performancepro.com',
        crypt('superadmin123', gen_salt('bf')),
        now(),
        'authenticated',
        'authenticated',
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"full_name": "System Superadmin"}'::jsonb,
        true
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
END $$;