-- Drop existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "goals_read_policy" ON goals;
DROP POLICY IF EXISTS "goals_insert_policy" ON goals;
DROP POLICY IF EXISTS "goals_update_policy" ON goals;
DROP POLICY IF EXISTS "goals_delete_policy" ON goals;

-- Create function to get user role without recursion
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- Create new organization-aware policies for profiles
CREATE POLICY "profiles_read_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow users to read their own profile
    id = auth.uid()
    OR
    -- Allow managers to read their team members' profiles
    manager_id = auth.uid()
    OR
    -- Allow organization-based access for admins
    (
      get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
      AND (
        get_user_role(auth.uid()) = 'superadmin'
        OR
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to create their own profile
    auth.uid() = id
    OR
    -- Allow organization-based access for admins
    (
      get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
      AND (
        get_user_role(auth.uid()) = 'superadmin'
        OR
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow users to update their own profile
    id = auth.uid()
    OR
    -- Allow managers to update their team members' profiles
    manager_id = auth.uid()
    OR
    -- Allow organization-based access for admins
    (
      get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
      AND (
        get_user_role(auth.uid()) = 'superadmin'
        OR
        organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "profiles_delete_policy"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    -- Allow organization-based access for admins
    get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
    AND (
      get_user_role(auth.uid()) = 'superadmin'
      OR
      organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Create new organization-aware policies for goals
CREATE POLICY "goals_read_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    -- Allow users to read their own goals
    user_id = auth.uid()
    OR
    -- Allow managers to read their team members' goals
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
    OR
    -- Allow organization-based access for admins
    (
      get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
      AND (
        get_user_role(auth.uid()) = 'superadmin'
        OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = goals.user_id
          AND profiles.organization_id = (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "goals_insert_policy"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to create their own goals
    user_id = auth.uid()
    OR
    -- Allow managers to create goals for their team members
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
    OR
    -- Allow organization-based access for admins
    (
      get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
      AND (
        get_user_role(auth.uid()) = 'superadmin'
        OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = goals.user_id
          AND profiles.organization_id = (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "goals_update_policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow users to update their own goals
    user_id = auth.uid()
    OR
    -- Allow managers to update their team members' goals
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
    OR
    -- Allow organization-based access for admins
    (
      get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
      AND (
        get_user_role(auth.uid()) = 'superadmin'
        OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = goals.user_id
          AND profiles.organization_id = (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "goals_delete_policy"
  ON goals
  FOR DELETE
  TO authenticated
  USING (
    -- Allow users to delete their own goals
    user_id = auth.uid()
    OR
    -- Allow managers to delete their team members' goals
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
    OR
    -- Allow organization-based access for admins
    (
      get_user_role(auth.uid()) IN ('superadmin', 'company_admin')
      AND (
        get_user_role(auth.uid()) = 'superadmin'
        OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = goals.user_id
          AND profiles.organization_id = (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
          )
        )
      )
    )
  );