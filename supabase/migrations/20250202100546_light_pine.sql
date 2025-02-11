-- Create necessary auth schema enums if they don't exist
DO $$ BEGIN
    CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();
    
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
      recovery_token,
      email_change_token_new,
      email_change_token_current,
      is_super_admin,
      is_sso_user,
      phone_confirmed_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
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
      encode(gen_random_bytes(32), 'base64'),
      encode(gen_random_bytes(32), 'base64'),
      encode(gen_random_bytes(32), 'base64'),
      true,
      false,
      null
    );

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
    UPDATE auth.users
    SET 
      is_super_admin = true,
      raw_user_meta_data = jsonb_set(raw_user_meta_data, '{full_name}', '"System Superadmin"'),
      updated_at = now(),
      email_confirmed_at = now()
    WHERE id = new_user_id;

    UPDATE public.profiles
    SET 
      role = 'superadmin',
      full_name = 'System Superadmin',
      updated_at = now()
    WHERE id = new_user_id;
  END IF;
END $$;