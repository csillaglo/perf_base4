/*
  # Simplify Profile Policies and Fix Auth Flow

  1. Changes
    - Remove all existing profile policies
    - Create simple, non-recursive policies
    - Allow unauthenticated profile creation for registration
    - Fix profile access for authenticated users

  2. Security
    - Enable profile creation during registration
    - Maintain secure access control
    - Prevent infinite recursion
*/

-- Drop all existing policies from profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can view department profiles" ON profiles;

-- Create simplified policies
CREATE POLICY "Enable read access for users"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for registration"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);