-- Drop existing problematic policies
DROP POLICY IF EXISTS "allow_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_profile" ON profiles;
DROP POLICY IF EXISTS "allow_delete_admin_only" ON profiles;
DROP POLICY IF EXISTS "org_admins_can_manage_users" ON profiles;

-- Create new optimized policies without recursion
CREATE POLICY "profiles_select_policy"
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
    auth.uid() = id OR                                    -- Users can update their own profile
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')  -- Admins and superadmins can update any profile
  );

CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Only superadmins can delete profiles
  );