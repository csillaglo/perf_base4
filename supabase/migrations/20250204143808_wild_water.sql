/*
  # Fix performance grades query

  1. Changes
    - Add function to handle performance grades query
    - Add policy for performance grades access
    - Ensure proper handling of NULL organization_id

  2. Security
    - Maintain RLS policies
    - Add secure function for fetching grades
*/

-- Drop existing policy
DROP POLICY IF EXISTS "performance_grades_read_policy" ON performance_grades;

-- Create function to fetch performance grades
CREATE OR REPLACE FUNCTION get_performance_grades(org_id uuid)
RETURNS SETOF performance_grades
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First try to get organization-specific grades
  RETURN QUERY
  SELECT *
  FROM performance_grades
  WHERE organization_id = org_id
  ORDER BY min_score;

  -- If no org-specific grades found, return default grades
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT *
    FROM performance_grades
    WHERE organization_id IS NULL
    ORDER BY min_score;
  END IF;
END;
$$;

-- Create new policy for performance grades
CREATE POLICY "performance_grades_read_policy"
  ON performance_grades
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NULL  -- Allow access to default grades
    OR
    organization_id = (      -- Allow access to org-specific grades
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_performance_grades(uuid) TO authenticated;