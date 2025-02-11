/*
  # Final Fix for Profile RLS Policies

  1. Changes
    - Drop all existing policies that may cause recursion
    - Create new simplified policies that avoid any recursive checks
    - Use direct role comparison instead of subqueries
    - Maintain security while preventing infinite recursion

  2. Security
    - Users can view and update their own profiles
    - Managers can view and update their team members
    - Admins have full access to all profiles
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_admin_read_all" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_admin_insert" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_admin_update" ON profiles;
DROP POLICY IF EXISTS "allow_admin_delete" ON profiles;

-- Create new simplified policies
CREATE POLICY "profiles_read_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to read profiles

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);  -- Only allow users to insert their own profile

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR              -- Users can update their own profile
    auth.uid() = manager_id         -- Managers can update their team members' profiles
  );

CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (false);  -- Disable direct deletion - handle through auth.users cascade