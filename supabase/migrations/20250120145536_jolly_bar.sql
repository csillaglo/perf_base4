/*
  # Add weight column to goals table

  1. Changes
    - Add `weight` column to `goals` table with default value of 0
    - Add check constraint to ensure weight is between 0 and 100
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'weight'
  ) THEN
    ALTER TABLE goals ADD COLUMN weight integer DEFAULT 0;
    ALTER TABLE goals ADD CONSTRAINT weight_range CHECK (weight >= 0 AND weight <= 100);
  END IF;
END $$;