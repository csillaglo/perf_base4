/*
  # Update app name handling

  1. Changes
    - Set default app name for existing organizations
    - Add NOT NULL constraint to app_name column
*/

-- Update existing organizations to have a default app name if not set
UPDATE organizations 
SET app_name = 'HR Performance'
WHERE app_name IS NULL;

-- Add NOT NULL constraint to app_name column
ALTER TABLE organizations 
ALTER COLUMN app_name SET NOT NULL;