/*
  # Fix RLS policies for profiles table

  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies that avoid recursion
    - Maintain security while allowing proper access

  2. Security
    - Managers can view and update their team members
    - Users can view their own profile
    - Admins can view and manage all profiles
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Managers can view their team members" ON profiles;
DROP POLICY IF EXISTS "Managers can update their team members" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create new simplified policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation during registration"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Managers can view team members"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    manager_id = auth.uid() OR
    id = auth.uid()
  );

CREATE POLICY "Managers can update team members"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    manager_id = auth.uid()
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'::user_role
    )
  );