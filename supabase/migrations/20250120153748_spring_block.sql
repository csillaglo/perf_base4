/*
  # Add evaluation score to goals table

  1. Changes
    - Add `evaluation_score` column to `goals` table
      - Integer column with values from 1 to 5
      - Default value of 1
      - Check constraint to ensure valid range
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'evaluation_score'
  ) THEN
    ALTER TABLE goals ADD COLUMN evaluation_score integer DEFAULT 1;
    ALTER TABLE goals ADD CONSTRAINT evaluation_score_range CHECK (evaluation_score >= 1 AND evaluation_score <= 5);
  END IF;
END $$;