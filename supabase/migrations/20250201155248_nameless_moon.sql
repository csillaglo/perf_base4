/*
  # Update goals table policies

  1. Changes
    - Add policies to allow managers to create and manage goals for their team members
    - Simplify existing policies for better clarity
    - Ensure proper access control for different roles

  2. Security
    - Managers can manage goals for their team members
    - Employees can manage their own goals
    - Admins have full access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "goals_read_policy" ON goals;
DROP POLICY IF EXISTS "goals_insert_policy" ON goals;
DROP POLICY IF EXISTS "managers_can_update_status" ON goals;
DROP POLICY IF EXISTS "employees_can_update_to_awaiting_evaluation" ON goals;
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can manage their own goals" ON goals;

-- Create new simplified policies
CREATE POLICY "goals_read_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own goals
    user_id = auth.uid()
    -- Managers can read their team members' goals
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = (
        SELECT manager_id FROM profiles WHERE id = goals.user_id
      )
    )
    -- Admins can read all goals
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "goals_insert_policy"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can create their own goals
    user_id = auth.uid()
    -- Managers can create goals for their team members
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = (
        SELECT manager_id FROM profiles WHERE id = goals.user_id
      )
    )
    -- Admins can create goals for anyone
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "goals_update_policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own goals
    user_id = auth.uid()
    -- Managers can update their team members' goals
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = (
        SELECT manager_id FROM profiles WHERE id = goals.user_id
      )
    )
    -- Admins can update any goals
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "goals_delete_policy"
  ON goals
  FOR DELETE
  TO authenticated
  USING (
    -- Users can delete their own goals
    user_id = auth.uid()
    -- Managers can delete their team members' goals
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = (
        SELECT manager_id FROM profiles WHERE id = goals.user_id
      )
    )
    -- Admins can delete any goals
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );