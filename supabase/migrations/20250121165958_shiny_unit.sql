/*
  # Restrict Evaluation Score Updates

  1. Changes
    - Add RLS policies to restrict evaluation score updates
    - Only managers and admins can modify evaluation scores
    - Employees can still update other goal fields

  2. Security
    - All authenticated users can view goals
    - Users can create and update their own goals (except evaluation scores)
    - Only managers and admins can update evaluation scores
*/

-- Drop existing goals policies
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can manage their own goals" ON goals;
DROP POLICY IF EXISTS "goals_read_policy" ON goals;
DROP POLICY IF EXISTS "goals_insert_policy" ON goals;
DROP POLICY IF EXISTS "goals_update_policy" ON goals;
DROP POLICY IF EXISTS "goals_update_basic_policy" ON goals;
DROP POLICY IF EXISTS "goals_update_evaluation_policy" ON goals;

-- Create new policies
CREATE POLICY "goals_read_policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR                           -- User's own goals
    goals.is_team_goal = true OR                      -- Team goals
    EXISTS (                                          -- Manager's team goals
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = (
        SELECT manager_id FROM profiles WHERE id = goals.user_id
      )
    )
  );

CREATE POLICY "goals_insert_policy"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()                             -- Users can only create their own goals
  );

-- Policy for regular updates (excluding evaluation_score)
CREATE POLICY "goals_update_regular_policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()                             -- User's own goals
  );

-- Policy for evaluation score updates
CREATE POLICY "goals_update_evaluation_policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (                                         -- Only managers and admins can update evaluation scores
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin' OR                   -- Admin can update any evaluation score
        (
          profiles.role = 'manager' AND              -- Manager can only update their team members' scores
          EXISTS (
            SELECT 1 FROM profiles team_member
            WHERE team_member.id = goals.user_id
            AND team_member.manager_id = profiles.id
          )
        )
      )
    )
  );