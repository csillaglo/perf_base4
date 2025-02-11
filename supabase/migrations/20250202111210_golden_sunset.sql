-- First, delete any existing superadmin
DO $$ 
BEGIN
  -- Delete from auth.users (this will cascade to profiles due to foreign key)
  DELETE FROM auth.users 
  WHERE email = 'superadmin@performancepro.com';
END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_all_reads_on_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_self_insert" ON profiles;
DROP POLICY IF EXISTS "allow_self_update" ON profiles;
DROP POLICY IF EXISTS "allow_own_goals" ON goals;
DROP POLICY IF EXISTS "allow_manager_access" ON goals;
DROP POLICY IF EXISTS "allow_admin_access" ON goals;

-- Create extremely simplified policies for profiles
CREATE POLICY "profiles_read_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR                    -- Users can update their own profile
    manager_id = auth.uid()               -- Managers can update their team members
  );

-- Create simplified policies for goals
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
    )
  );