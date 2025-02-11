-- Create summary_evaluations table
CREATE TABLE IF NOT EXISTS summary_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
  summary text,
  suggestions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE summary_evaluations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "summary_evaluations_read_policy"
  ON summary_evaluations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR              -- Users can read their own summaries
    EXISTS (                             -- Managers can read their team members' summaries
      SELECT 1 FROM profiles
      WHERE profiles.id = summary_evaluations.user_id
      AND profiles.manager_id = auth.uid()
    ) OR
    EXISTS (                             -- HR admins can read summaries from their organization
      SELECT 1 FROM profiles admin
      JOIN profiles user_profile ON user_profile.id = summary_evaluations.user_id
      WHERE admin.id = auth.uid()
      AND admin.role = 'hr_admin'
      AND admin.organization_id = user_profile.organization_id
    ) OR
    EXISTS (                             -- Company admins can read summaries from their organization
      SELECT 1 FROM profiles admin
      JOIN profiles user_profile ON user_profile.id = summary_evaluations.user_id
      WHERE admin.id = auth.uid()
      AND admin.role = 'company_admin'
      AND admin.organization_id = user_profile.organization_id
    ) OR
    EXISTS (                             -- Superadmins can read all summaries
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "summary_evaluations_write_policy"
  ON summary_evaluations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (                             -- Only managers and admins can write summaries
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        -- Managers can only write summaries for their team members
        (
          profiles.role = 'manager'
          AND EXISTS (
            SELECT 1 FROM profiles team_member
            WHERE team_member.id = summary_evaluations.user_id
            AND team_member.manager_id = profiles.id
          )
        )
        OR
        -- HR admins can write summaries for their organization
        (
          profiles.role = 'hr_admin'
          AND EXISTS (
            SELECT 1 FROM profiles user_profile
            WHERE user_profile.id = summary_evaluations.user_id
            AND user_profile.organization_id = profiles.organization_id
          )
        )
        OR
        -- Company admins can write summaries for their organization
        (
          profiles.role = 'company_admin'
          AND EXISTS (
            SELECT 1 FROM profiles user_profile
            WHERE user_profile.id = summary_evaluations.user_id
            AND user_profile.organization_id = profiles.organization_id
          )
        )
        OR
        -- Superadmins can write all summaries
        profiles.role = 'superadmin'
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS summary_evaluations_user_id_idx ON summary_evaluations(user_id);
CREATE INDEX IF NOT EXISTS summary_evaluations_cycle_id_idx ON summary_evaluations(cycle_id);
CREATE INDEX IF NOT EXISTS summary_evaluations_user_cycle_idx ON summary_evaluations(user_id, cycle_id);