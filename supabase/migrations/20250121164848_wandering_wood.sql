/*
  # Fix RLS policies for admin access

  1. Changes
    - Drop existing policies
    - Create new policies that properly handle admin access
    - Ensure admins can view and manage all profiles
    - Maintain existing access for users and managers

  2. Security
    - Admins have full access to all profiles
    - Users can view and update their own profiles
    - Managers can view and update their team members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create new policies with proper admin access
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    ) OR
    id = auth.uid() OR                    -- User can view their own profile
    manager_id = auth.uid()               -- Manager can view their team members
  );

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    ) OR
    auth.uid() = id                       -- User can create their own profile
  );

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    ) OR
    id = auth.uid() OR                    -- User can update their own profile
    manager_id = auth.uid()               -- Manager can update their team members
  );

CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );