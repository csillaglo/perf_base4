-- Create translations table for database content
CREATE TABLE translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL,
  table_name text NOT NULL,
  field_name text NOT NULL,
  language text NOT NULL,
  translation text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (record_id, table_name, field_name, language)
);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "translations_read_policy"
  ON translations
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to read translations

CREATE POLICY "translations_write_policy"
  ON translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('superadmin', 'company_admin')
    )
  );

-- Create function to get translation
CREATE OR REPLACE FUNCTION get_translation(
  p_record_id uuid,
  p_table_name text,
  p_field_name text,
  p_language text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT translation
    FROM translations
    WHERE record_id = p_record_id
    AND table_name = p_table_name
    AND field_name = p_field_name
    AND language = p_language
  );
END;
$$;

-- Create function to set translation
CREATE OR REPLACE FUNCTION set_translation(
  p_record_id uuid,
  p_table_name text,
  p_field_name text,
  p_language text,
  p_translation text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO translations (
    record_id,
    table_name,
    field_name,
    language,
    translation
  )
  VALUES (
    p_record_id,
    p_table_name,
    p_field_name,
    p_language,
    p_translation
  )
  ON CONFLICT (record_id, table_name, field_name, language)
  DO UPDATE SET
    translation = p_translation,
    updated_at = now();
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_translation TO authenticated;
GRANT EXECUTE ON FUNCTION set_translation TO authenticated;