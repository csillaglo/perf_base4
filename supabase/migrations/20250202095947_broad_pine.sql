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
    -- Create auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
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
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "System Superadmin"}'::jsonb,
      now(),
      now(),
      encode(gen_random_bytes(32), 'base64'),
      NULL,
      encode(gen_random_bytes(32), 'base64'),
      encode(gen_random_bytes(32), 'base64')
    ) RETURNING id INTO new_user_id;
  END IF;

  -- Create or update profile
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
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'superadmin',
    full_name = 'System Superadmin',
    updated_at = now();
END $$;