-- First transaction: Drop existing policies that reference the role column
BEGIN;
  DROP POLICY IF EXISTS "goals_read_policy" ON goals;
  DROP POLICY IF EXISTS "goals_write_policy" ON goals;
  DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
  DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
  DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
  DROP POLICY IF EXISTS "org_access_policy" ON organizations;
  DROP POLICY IF EXISTS "superadmin_full_access" ON organizations;
  DROP POLICY IF EXISTS "users_can_view_own_org" ON organizations;
COMMIT;

-- Second transaction: Add the new enum value
BEGIN;
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hr_admin';
COMMIT;

-- Third transaction: Create new policies
BEGIN;
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
      role IN ('superadmin', 'company_admin', 'hr_admin')  -- Admins can update profiles
    );

  CREATE POLICY "profiles_delete_policy"
    ON profiles
    FOR DELETE
    TO authenticated
    USING (role = 'superadmin');  -- Only superadmins can delete profiles

  -- Create policies for goals
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
      EXISTS (                             -- HR admins can read goals from their organization
        SELECT 1 FROM profiles admin
        JOIN profiles user_profile ON user_profile.id = goals.user_id
        WHERE admin.id = auth.uid()
        AND admin.role = 'hr_admin'
        AND admin.organization_id = user_profile.organization_id
      ) OR
      EXISTS (                             -- Company admins can read goals from their organization
        SELECT 1 FROM profiles admin
        JOIN profiles user_profile ON user_profile.id = goals.user_id
        WHERE admin.id = auth.uid()
        AND admin.role = 'company_admin'
        AND admin.organization_id = user_profile.organization_id
      ) OR
      EXISTS (                             -- Superadmins can read all goals
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'superadmin'
      )
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
      EXISTS (                             -- HR admins can manage goals from their organization
        SELECT 1 FROM profiles admin
        JOIN profiles user_profile ON user_profile.id = goals.user_id
        WHERE admin.id = auth.uid()
        AND admin.role = 'hr_admin'
        AND admin.organization_id = user_profile.organization_id
      ) OR
      EXISTS (                             -- Company admins can manage goals from their organization
        SELECT 1 FROM profiles admin
        JOIN profiles user_profile ON user_profile.id = goals.user_id
        WHERE admin.id = auth.uid()
        AND admin.role = 'company_admin'
        AND admin.organization_id = user_profile.organization_id
      ) OR
      EXISTS (                             -- Superadmins can manage all goals
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'superadmin'
      )
    );

  -- Create policy for organizations
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
COMMIT;