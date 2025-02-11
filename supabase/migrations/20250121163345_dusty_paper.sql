/*
  # Add job-related fields to profiles

  1. Changes
    - Add department field to profiles table
    - Add job_level field to profiles table
    - Add job_name field to profiles table

  2. Notes
    - All fields are nullable to support existing users
    - No changes to existing RLS policies needed
*/

DO $$ BEGIN
  -- Add department field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'department'
  ) THEN
    ALTER TABLE profiles ADD COLUMN department text;
  END IF;

  -- Add job_level field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'job_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN job_level text;
  END IF;

  -- Add job_name field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'job_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN job_name text;
  END IF;
END $$;