-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create necessary auth schema enums
DO $$ BEGIN
    CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'company_admin', 'manager', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create evaluation status enum
DO $$ BEGIN
    CREATE TYPE evaluation_status AS ENUM (
        'awaiting_goal_setting',
        'awaiting_evaluation',
        'awaiting_approval',
        'finalized'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create auth tables
CREATE TABLE IF NOT EXISTS auth.users (
    instance_id uuid,
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    aud character varying(255),
    role character varying(255),
    email character varying(255) UNIQUE,
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone DEFAULT now(),
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb DEFAULT '{"provider": "email", "providers": ["email"]}'::jsonb,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    is_super_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    phone text UNIQUE,
    phone_confirmed_at timestamp with time zone,
    phone_change text,
    phone_change_token character varying(255),
    phone_change_sent_at timestamp with time zone,
    email_change_token_current character varying(255),
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255),
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false,
    deleted_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    instance_id uuid,
    id bigserial PRIMARY KEY,
    token character varying(255),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    revoked boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    parent character varying(255)
);

CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone
);

-- Create application tables
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    role user_role DEFAULT 'employee'::user_role,
    organization_id uuid REFERENCES organizations(id),
    department text,
    job_level text,
    job_name text,
    manager_id uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    is_team_goal boolean DEFAULT false,
    progress integer DEFAULT 0,
    status text DEFAULT 'pending',
    due_date date,
    weight integer DEFAULT 0,
    evaluation_score integer DEFAULT 1,
    evaluation_status evaluation_status DEFAULT 'awaiting_goal_setting'::evaluation_status,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT weight_range CHECK (weight >= 0 AND weight <= 100),
    CONSTRAINT evaluation_score_range CHECK (evaluation_score >= 1 AND evaluation_score <= 5)
);

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

-- Create indexes
CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (instance_id, email);
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens (token);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions (user_id);
CREATE INDEX IF NOT EXISTS users_email_partial_idx ON auth.users (email) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_grades ENABLE ROW LEVEL SECURITY;

-- Create helper functions
CREATE OR REPLACE FUNCTION auth.email_exists(email text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users WHERE users.email = email_exists.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS uuid AS $$
BEGIN
    RETURN nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

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

-- Create RLS policies
CREATE POLICY "profiles_read_policy"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "profiles_insert_policy"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = id OR              -- Users can update their own profile
        auth.uid() = manager_id OR      -- Managers can update their team members' profiles
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'company_admin')  -- Admins can update any profile
    );

CREATE POLICY "profiles_delete_policy"
    ON profiles
    FOR DELETE
    TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Only superadmins can delete profiles
    );

CREATE POLICY "goals_read_policy"
    ON goals
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR              -- Users can read their own goals
        EXISTS (                             -- Managers can read their team members' goals
            SELECT 1 FROM profiles
            WHERE profiles.id = goals.user_id
            AND profiles.manager_id = auth.uid()
        ) OR
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Superadmins can read all goals
    );

CREATE POLICY "goals_write_policy"
    ON goals
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid() OR              -- Users can manage their own goals
        EXISTS (                             -- Managers can manage their team members' goals
            SELECT 1 FROM profiles
            WHERE profiles.id = goals.user_id
            AND profiles.manager_id = auth.uid()
        ) OR
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'  -- Superadmins can manage all goals
    );

CREATE POLICY "org_access_policy"
    ON organizations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.role = 'superadmin' OR  -- Superadmins can access all orgs
                profiles.organization_id = organizations.id  -- Users can access their own org
            )
        )
    );

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

-- Insert default performance grades
INSERT INTO performance_grades (organization_id, min_score, max_score, grade_text, grade_level) VALUES
    (NULL, 0, 20, 'Unsatisfactory', 1),
    (NULL, 21, 40, 'Weak', 2),
    (NULL, 41, 60, 'Normal', 3),
    (NULL, 61, 80, 'Good', 4),
    (NULL, 81, 100, 'Excellent', 5)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, authenticated, anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_emails() TO authenticated;