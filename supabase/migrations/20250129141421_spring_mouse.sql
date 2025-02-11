/*
  # Create secure email access function

  This migration creates a secure function to access user emails from auth.users
  while maintaining proper access control.

  1. New Function
    - Creates get_user_emails function to securely expose email addresses
    - Implements proper access control through role checks
    - Only shows emails to admins and users themselves

  2. Security
    - Uses SECURITY DEFINER to ensure proper access control
    - Implements row-level security through function logic
*/

-- Create function to securely access user emails
CREATE OR REPLACE FUNCTION get_user_emails()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name
  FROM auth.users au
  WHERE 
    -- User can see their own email
    au.id = auth.uid()
    -- Admins can see all emails
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails() TO authenticated;