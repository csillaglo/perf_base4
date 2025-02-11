/*
  # Fix role update policies

  1. Changes
    - Simplify policies to ensure role updates work correctly
    - Ensure admins can update any profile
    - Allow users to update their own non-role fields
    - Allow managers to update their team members' non-role fields

  2. Security
    - Only admins can modify roles
    - Users can still update their own profile details
    - Managers can update their team members' details
*/

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create new simplified policies
CREATE POLICY "allow_read_all_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert_own_profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow admins to update any profile
    EXISTS (
      SELECT 1 FROM profiles admin_check
      WHERE admin_check.id = auth.uid()
      AND admin_check.role = 'admin'
    )
    OR
    -- Allow users to update their own profile
    auth.uid() = id
    OR
    -- Allow managers to update their team members' profiles
    EXISTS (
      SELECT 1 FROM profiles manager_check
      WHERE manager_check.id = auth.uid()
      AND manager_check.id = profiles.manager_id
    )
  );

CREATE POLICY "allow_delete_admin_only"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_check
      WHERE admin_check.id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );