/*
  # Add welcome message feature
  
  1. New Tables
    - `welcome_messages`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `welcome_messages` table
    - Add policies for organization-based access
*/

-- Create welcome_messages table
CREATE TABLE welcome_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE welcome_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "welcome_messages_read_policy"
  ON welcome_messages
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "welcome_messages_write_policy"
  ON welcome_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'superadmin')
      AND (
        role = 'superadmin'
        OR
        organization_id = welcome_messages.organization_id
      )
    )
  );

-- Insert default welcome message for each organization
INSERT INTO welcome_messages (organization_id, content)
SELECT 
  id as organization_id,
  'Welcome to PerformancePro! This platform helps you track and improve your performance through goal setting and evaluations. Contact your administrator to learn more about using the system effectively.'
FROM organizations
ON CONFLICT DO NOTHING;