-- First transaction: Add the new enum value
BEGIN;
  -- Add hr_admin to user_role enum
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hr_admin';
COMMIT;

-- Second transaction: Update policies
BEGIN;
  -- Drop existing policies
  DROP POLICY IF EXISTS "goals_read_policy" ON goals;
  DROP POLICY IF EXISTS "goals_write_policy" ON goals;

  -- Create updated policies that include HR admin access
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
      EXISTS (                             -- HR admins can manage goals from their organization
        SELECT 1 FROM profiles admin
        JOIN profiles user_profile ON user_profile.id = goals.user_id
        WHERE admin.id = auth.uid()
        AND admin.role = 'hr_admin'
        AND admin.organization_id = user_profile.organization_id
      ) OR
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Superadmins can manage all goals
    );

  -- Update the get_user_emails function to include HR admin access
  CREATE OR REPLACE FUNCTION get_user_emails()
  RETURNS TABLE (
    id uuid,
    email text,
    full_name text
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    RETURN QUERY
    SELECT 
      au.id,
      au.email::text,
      COALESCE(p.full_name, '')::text
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE 
      -- User can see their own email
      au.id = auth.uid()
      -- Superadmins can see all emails
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'superadmin'
      )
      -- HR admins can see emails from their organization
      OR EXISTS (
        SELECT 1 FROM profiles admin
        JOIN profiles user_profile ON user_profile.organization_id = admin.organization_id
        WHERE admin.id = auth.uid()
        AND admin.role = 'hr_admin'
        AND user_profile.id = au.id
      )
      -- Company admins can see emails from their organization
      OR EXISTS (
        SELECT 1 FROM profiles admin
        JOIN profiles user_profile ON user_profile.id = au.id
        WHERE admin.id = auth.uid()
        AND admin.role = 'company_admin'
        AND admin.organization_id = user_profile.organization_id
      )
      -- Managers can see their team members' emails
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = au.id
        AND profiles.manager_id = auth.uid()
      );
  END;
  $$;

COMMIT;