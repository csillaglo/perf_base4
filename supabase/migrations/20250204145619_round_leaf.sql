-- Create user status enum
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status field to profiles table with default value
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'active';

-- Update existing profiles to have active status
UPDATE profiles SET status = 'active' WHERE status IS NULL;