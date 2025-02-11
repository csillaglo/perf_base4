-- Add evaluation_notes column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS evaluation_notes text;

-- Update RLS policies to ensure proper access control for evaluation_notes
DROP POLICY IF EXISTS "goals_read_policy" ON goals;
DROP POLICY IF EXISTS "goals_write_policy" ON goals;

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