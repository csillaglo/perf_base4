-- Drop existing function
DROP FUNCTION IF EXISTS get_user_emails();

-- Create updated function to securely access user emails
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
    au.email::text,
    COALESCE(p.full_name, '')::text
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE 
    -- User can see their own email
    au.id = auth.uid()
    -- Superadmins can see all emails
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
    -- App admins can see all emails
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'app_admin'
    )
    -- Company admins can see emails from their organization
    OR EXISTS (
      SELECT 1 FROM profiles admin
      JOIN profiles user_profile ON user_profile.id = au.id
      WHERE admin.id = auth.uid()
      AND admin.role = 'company_admin'
      AND admin.organization_id = user_profile.organization_id
    )
    -- Managers can see their team members' emails
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = au.id
      AND profiles.manager_id = auth.uid()
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails() TO authenticated;