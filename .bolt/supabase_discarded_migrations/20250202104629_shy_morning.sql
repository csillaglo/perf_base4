-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the superadmin password with proper hashing
UPDATE auth.users 
SET encrypted_password = crypt('superadmin123', gen_salt('bf', 10))
WHERE email = 'superadmin@performancepro.com';

-- Ensure email is confirmed
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'superadmin@performancepro.com';

-- Add necessary auth settings
UPDATE auth.users
SET 
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"]}'::jsonb,
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name": "System Superadmin"}'::jsonb
WHERE email = 'superadmin@performancepro.com';

-- Ensure proper role assignment
UPDATE auth.users
SET role = 'authenticated'
WHERE email = 'superadmin@performancepro.com' AND role IS NULL;