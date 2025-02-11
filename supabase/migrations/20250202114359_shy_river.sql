-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_delete_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_read_goals" ON goals;
DROP POLICY IF EXISTS "allow_write_goals" ON goals;
DROP POLICY IF EXISTS "allow_own_goals" ON goals;
DROP POLICY IF EXISTS "allow_manager_access" ON goals;
DROP POLICY IF EXISTS "allow_admin_access" ON goals;
DROP POLICY IF EXISTS "allow_org_access" ON organizations;

-- Create simplified policies for profiles
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
    auth.uid() = manager_id OR      -- Managers can update their team members' profiles
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'company_admin')  -- Admins can update any profile
  );

CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Only superadmins can delete profiles
  );

-- Create simplified policies for goals
CREATE POLICY "goals_read_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR              -- Users can read their own goals
    EXISTS (                             -- Managers can read their team members' goals
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    ) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Superadmins can read all goals
  );

CREATE POLICY "goals_write_policy"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR              -- Users can manage their own goals
    EXISTS (                             -- Managers can manage their team members' goals
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    ) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Superadmins can manage all goals
  );

-- Create simplified policies for organizations
CREATE POLICY "org_access_policy"
  ON organizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'superadmin' OR  -- Superadmins can access all orgs
        profiles.organization_id = organizations.id  -- Users can access their own org
      )
    )
  );