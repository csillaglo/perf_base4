-- First transaction: Add the new enum value
BEGIN;
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'app_admin';
COMMIT;

-- Second transaction: Update policies
BEGIN;
  -- Drop existing policies
  DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
  DROP POLICY IF EXISTS "goals_read_policy" ON goals;
  DROP POLICY IF EXISTS "goals_write_policy" ON goals;

  -- Create new policies that include app_admin access
  CREATE POLICY "profiles_read_policy"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (
      -- App admins and superadmins can read all profiles
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('app_admin', 'superadmin')
      OR
      -- Company admins can read profiles from their organization
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
      -- App admins and superadmins can create any profile
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('app_admin', 'superadmin')
      OR
      -- Company admins can only create profiles in their organization
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
        AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
      OR
      -- Users can create their own profile
      auth.uid() = id
    );

  CREATE POLICY "profiles_update_policy"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (
      -- App admins and superadmins can update any profile
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('app_admin', 'superadmin')
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
      -- Only app admins and superadmins can delete profiles
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('app_admin', 'superadmin')
    );

  -- Update organization policies
  DROP POLICY IF EXISTS "users_can_view_own_org" ON organizations;

  CREATE POLICY "organization_access_policy"
    ON organizations
    FOR ALL
    TO authenticated
    USING (
      -- App admins and superadmins can access all organizations
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('app_admin', 'superadmin')
      OR
      -- Users can access their own organization
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.organization_id = organizations.id
      )
    );

  -- Update goals policies
  CREATE POLICY "goals_read_policy"
    ON goals
    FOR SELECT
    TO authenticated
    USING (
      -- App admins and superadmins can read all goals
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('app_admin', 'superadmin')
      OR
      -- Company admins can read goals from their organization
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = goals.user_id
          AND profiles.organization_id = (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
          )
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

  CREATE POLICY "goals_write_policy"
    ON goals
    FOR ALL
    TO authenticated
    USING (
      -- App admins and superadmins can manage all goals
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('app_admin', 'superadmin')
      OR
      -- Company admins can manage goals from their organization
      (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'company_admin'
        AND EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = goals.user_id
          AND profiles.organization_id = (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
          )
        )
      )
      OR
      -- Users can manage their own goals
      user_id = auth.uid()
      OR
      -- Managers can manage their team members' goals
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = goals.user_id
        AND profiles.manager_id = auth.uid()
      )
    );
COMMIT;