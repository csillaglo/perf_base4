-- Create performance_grades table
CREATE TABLE IF NOT EXISTS performance_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  min_score integer NOT NULL,
  max_score integer NOT NULL,
  grade_text text NOT NULL,
  grade_level integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT score_range CHECK (min_score >= 0 AND max_score <= 100 AND min_score < max_score),
  CONSTRAINT grade_level_range CHECK (grade_level >= 1 AND grade_level <= 5)
);

-- Enable RLS
ALTER TABLE performance_grades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "performance_grades_read_policy"
  ON performance_grades
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NULL OR  -- Allow reading default grades
    organization_id IN (        -- Allow reading org-specific grades
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Insert default grade ranges
INSERT INTO performance_grades (organization_id, min_score, max_score, grade_text, grade_level) VALUES
  (NULL, 0, 20, 'Unsatisfactory', 1),
  (NULL, 21, 40, 'Weak', 2),
  (NULL, 41, 60, 'Normal', 3),
  (NULL, 61, 80, 'Good', 4),
  (NULL, 81, 100, 'Excellent', 5);