-- Create user status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status field to profiles table with default value
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'active';

-- Update existing profiles to have active status
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- Create function to check if user is active
CREATE OR REPLACE FUNCTION is_user_active(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND status = 'active'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_user_active(uuid) TO authenticated;