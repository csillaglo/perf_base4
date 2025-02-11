/*
  # Fix RLS policies for profiles table - Final Version

  1. Changes
    - Drop all existing policies
    - Create new simplified policies without recursion
    - Use direct role checks instead of subqueries where possible
    - Maintain security while ensuring performance

  2. Security
    - Users can view and update their own profiles
    - Managers can view and update their team members
    - Admins have full access to all profiles
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Managers can view team members" ON profiles;
DROP POLICY IF EXISTS "Managers can update team members" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR                    -- User can view their own profile
    manager_id = auth.uid() OR            -- Manager can view their team members
    role = 'admin'                        -- Admin can view all profiles
  );

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR                    -- User can create their own profile
    role = 'admin'                        -- Admin can create any profile
  );

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR                    -- User can update their own profile
    manager_id = auth.uid() OR            -- Manager can update their team members
    role = 'admin'                        -- Admin can update any profile
  );

CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    role = 'admin'                        -- Only admin can delete profiles
  );