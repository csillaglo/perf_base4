-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "goals_read_policy" ON goals;
DROP POLICY IF EXISTS "goals_insert_policy" ON goals;
DROP POLICY IF EXISTS "goals_update_policy" ON goals;
DROP POLICY IF EXISTS "goals_delete_policy" ON goals;

-- Create extremely simplified policies for profiles
CREATE POLICY "allow_all_reads_on_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_self_insert"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_self_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create simplified policies for goals
CREATE POLICY "allow_own_goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "allow_manager_access"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = goals.user_id
      AND profiles.manager_id = auth.uid()
    )
  );

CREATE POLICY "allow_admin_access"
  ON goals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      WHERE p1.id = auth.uid()
      AND p1.role IN ('superadmin', 'company_admin')
      AND (
        p1.role = 'superadmin'
        OR
        EXISTS (
          SELECT 1 FROM profiles p2
          WHERE p2.id = goals.user_id
          AND p2.organization_id = p1.organization_id
        )
      )
    )
  );