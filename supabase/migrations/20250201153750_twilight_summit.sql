/*
  # Add evaluation status to goals table

  1. Changes
    - Add evaluation_status enum type
    - Add evaluation_status column to goals table with default value
    - Update RLS policies to handle status changes

  2. Security
    - Only managers can change status to any value
    - Employees can only change status to 'awaiting_evaluation'
*/

-- Create enum for evaluation status
DO $$ BEGIN
  CREATE TYPE evaluation_status AS ENUM (
    'awaiting_goal_setting',
    'awaiting_evaluation',
    'awaiting_approval',
    'finalized'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add evaluation_status column to goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS evaluation_status evaluation_status 
DEFAULT 'awaiting_goal_setting'::evaluation_status;

-- Update existing goals to have a status
UPDATE goals 
SET evaluation_status = (
  CASE
    WHEN evaluation_score IS NOT NULL 
    THEN 'finalized'::evaluation_status
    ELSE 'awaiting_goal_setting'::evaluation_status
  END
);

-- Add policies for status updates
DROP POLICY IF EXISTS "allow_status_update_by_role" ON goals;

CREATE POLICY "managers_can_update_status"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'manager' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "employees_can_update_to_awaiting_evaluation"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    evaluation_status = 'awaiting_evaluation'::evaluation_status
  );