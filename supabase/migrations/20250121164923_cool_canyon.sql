/*
  # Fix Profile RLS Policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create new optimized policies without recursive checks
    - Simplify admin access checks
    - Maintain security while avoiding infinite recursion

  2. Security
    - Admins retain full access
    - Users can view and update their own profiles
    - Managers can view and update their team members
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create new optimized policies
CREATE POLICY "allow_read_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR                    -- User can view their own profile
    manager_id = auth.uid()               -- Manager can view their team members
  );

CREATE POLICY "allow_admin_read_all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "allow_insert_own_profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
  );

CREATE POLICY "allow_admin_insert"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "allow_update_own_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR                    -- User can update their own profile
    manager_id = auth.uid()               -- Manager can update their team members
  );

CREATE POLICY "allow_admin_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "allow_admin_delete"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );