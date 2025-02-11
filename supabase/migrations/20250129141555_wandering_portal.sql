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
    au.email::text,  -- Explicitly cast to text
    COALESCE(au.raw_user_meta_data->>'full_name', '')::text  -- Explicitly cast to text
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