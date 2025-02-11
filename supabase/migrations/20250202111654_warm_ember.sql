-- Drop existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "goals_read_policy" ON goals;
DROP POLICY IF EXISTS "goals_write_policy" ON goals;

-- Create simplified policies for profiles
CREATE POLICY "allow_read_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to read profiles

CREATE POLICY "allow_insert_own_profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);  -- Only allow users to insert their own profile

CREATE POLICY "allow_update_profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR              -- Users can update their own profile
    auth.uid() = manager_id OR      -- Managers can update their team members' profiles
    role IN ('app_admin', 'superadmin', 'company_admin')  -- Admins can update any profile
  );

CREATE POLICY "allow_delete_profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (role IN ('app_admin', 'superadmin'));  -- Only app admins and superadmins can delete profiles

-- Create simplified policies for goals
CREATE POLICY "allow_read_goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR              -- Users can read their own goals
    EXISTS (                             -- Managers can read their team members' goals
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
  );

CREATE POLICY "allow_write_goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR              -- Users can manage their own goals
    EXISTS (                             -- Managers can manage their team members' goals
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
  );

-- Create simplified policies for organizations
DROP POLICY IF EXISTS "users_can_view_own_org" ON organizations;
DROP POLICY IF EXISTS "organization_access_policy" ON organizations;

CREATE POLICY "allow_org_access"
  ON organizations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role IN ('app_admin', 'superadmin') OR  -- App admins and superadmins can access all orgs
        profiles.organization_id = organizations.id       -- Users can access their own org
      )
    )
  );