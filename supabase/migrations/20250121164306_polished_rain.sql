/*
  # Add manager-employee relationship

  1. Changes
    - Add `manager_id` column to profiles table
    - Add foreign key constraint to ensure manager_id references valid profiles
    - Add RLS policies for manager access

  2. Security
    - Enable managers to view and manage their team members
    - Ensure employees can see their manager's information
*/

DO $$ BEGIN
  -- Add manager_id field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'manager_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN manager_id uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Update RLS policies for manager access
CREATE POLICY "Managers can view their team members"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = manager_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'manager'::user_role
      AND id = profiles.manager_id
    )
  );

CREATE POLICY "Managers can update their team members"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'manager'::user_role
      AND id = profiles.manager_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'manager'::user_role
      AND id = profiles.manager_id
    )
  );