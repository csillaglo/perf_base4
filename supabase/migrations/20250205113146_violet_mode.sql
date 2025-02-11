/*
  # Add evaluation cycles support
  
  1. New Tables
    - `evaluation_cycles`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `organization_id` (uuid, required, references organizations)
      - `start_date` (date, required)
      - `end_date` (date, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `cycle_id` to goals table to link goals to cycles
    
  3. Security
    - Enable RLS on evaluation_cycles table
    - Add policies for organization-based access
*/

-- Create evaluation cycles table
CREATE TABLE evaluation_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Add cycle_id to goals
ALTER TABLE goals ADD COLUMN cycle_id uuid REFERENCES evaluation_cycles(id);

-- Enable RLS
ALTER TABLE evaluation_cycles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for evaluation_cycles
CREATE POLICY "evaluation_cycles_org_access"
  ON evaluation_cycles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        -- Superadmins can access all cycles
        profiles.role = 'superadmin'
        OR
        -- Company admins and HR admins can access their organization's cycles
        (
          profiles.role IN ('company_admin', 'hr_admin')
          AND profiles.organization_id = evaluation_cycles.organization_id
        )
        OR
        -- Other users can access their organization's cycles
        profiles.organization_id = evaluation_cycles.organization_id
      )
    )
  );