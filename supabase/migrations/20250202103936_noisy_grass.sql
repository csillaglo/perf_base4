BEGIN;

-- First add the new enum value
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'company_admin';

-- Update existing admin users to company_admin
UPDATE profiles
SET role = 'company_admin'::user_role
WHERE role = 'admin'::user_role;

-- Since PostgreSQL doesn't support dropping enum values directly,
-- we'll need to create a new type and replace the old one if we want
-- to remove the 'admin' value. However, this is complex and potentially
-- risky, so we'll just leave the old value for now to maintain
-- backwards compatibility.

COMMIT;