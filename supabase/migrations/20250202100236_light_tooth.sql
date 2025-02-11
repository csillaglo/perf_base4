-- Create initial superadmin user
DO $$ 
DECLARE 
  new_user_id uuid;
BEGIN
  -- First check if the user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'superadmin@performancepro.com';

  -- If user doesn't exist, create it
  IF new_user_id IS NULL THEN
    -- Create auth user with all required fields
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'superadmin@performancepro.com',
      crypt('superadmin123', gen_salt('bf')),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "System Superadmin"}'::jsonb,
      now(),
      now(),
      encode(gen_random_bytes(32), 'base64'),
      encode(gen_random_bytes(32), 'base64')
    ) RETURNING id INTO new_user_id;

    -- Create profile for the new superadmin
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
  ELSE
    -- Update existing user's profile to ensure superadmin role
    UPDATE public.profiles
    SET 
      role = 'superadmin',
      full_name = 'System Superadmin',
      updated_at = now()
    WHERE id = new_user_id;
  END IF;
END $$;