-- Add status field to evaluation_cycles
ALTER TABLE evaluation_cycles ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Update RLS policies to allow status updates
DROP POLICY IF EXISTS "evaluation_cycles_org_access" ON evaluation_cycles;

CREATE POLICY "evaluation_cycles_org_access"
  ON evaluation_cycles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        -- Superadmins can access all cycles
        profiles.role = 'superadmin'
        OR
        -- Company admins and HR admins can access their organization's cycles
        (
          profiles.role IN ('company_admin', 'hr_admin')
          AND profiles.organization_id = evaluation_cycles.organization_id
        )
        OR
        -- Other users can access their organization's cycles
        profiles.organization_id = evaluation_cycles.organization_id
      )
    )
  );