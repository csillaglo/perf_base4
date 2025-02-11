-- Drop existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "goals_read_policy" ON goals;
DROP POLICY IF EXISTS "goals_insert_policy" ON goals;
DROP POLICY IF EXISTS "goals_update_policy" ON goals;
DROP POLICY IF EXISTS "goals_delete_policy" ON goals;

-- Create new organization-aware policies for profiles
CREATE POLICY "profiles_read_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Superadmins can read all profiles
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Company admins can only read profiles from their organization
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
    OR
    -- Users can read their own profile
    id = auth.uid()
    OR
    -- Managers can read their team members' profiles
    manager_id = auth.uid()
  );

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Superadmins can create any profile
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Company admins can only create profiles in their organization
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
    OR
    -- Users can create their own profile during registration
    auth.uid() = id
  );

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Superadmins can update any profile
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Company admins can only update profiles in their organization
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
    OR
    -- Users can update their own profile
    id = auth.uid()
    OR
    -- Managers can update their team members' profiles
    manager_id = auth.uid()
  );

CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    -- Only superadmins and company admins can delete profiles
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'company_admin')
      AND
      -- Company admins can only delete profiles from their organization
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
        OR
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
    )
  );

-- Create new organization-aware policies for goals
CREATE POLICY "goals_read_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    -- Superadmins can read all goals
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Company admins can only read goals from their organization
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      AND (
        SELECT organization_id FROM profiles WHERE id = goals.user_id
      ) = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    -- Users can read their own goals
    user_id = auth.uid()
    OR
    -- Managers can read their team members' goals
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
  );

CREATE POLICY "goals_insert_policy"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Superadmins can create goals for anyone
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Company admins can only create goals for users in their organization
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      AND (
        SELECT organization_id FROM profiles WHERE id = goals.user_id
      ) = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    -- Users can create their own goals
    user_id = auth.uid()
    OR
    -- Managers can create goals for their team members
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
  );

CREATE POLICY "goals_update_policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    -- Superadmins can update any goals
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Company admins can only update goals from their organization
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      AND (
        SELECT organization_id FROM profiles WHERE id = goals.user_id
      ) = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    -- Users can update their own goals
    user_id = auth.uid()
    OR
    -- Managers can update their team members' goals
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
  );

CREATE POLICY "goals_delete_policy"
  ON goals
  FOR DELETE
  TO authenticated
  USING (
    -- Superadmins can delete any goals
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Company admins can only delete goals from their organization
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
      AND (
        SELECT organization_id FROM profiles WHERE id = goals.user_id
      ) = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR
    -- Users can delete their own goals
    user_id = auth.uid()
    OR
    -- Managers can delete their team members' goals
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
  );