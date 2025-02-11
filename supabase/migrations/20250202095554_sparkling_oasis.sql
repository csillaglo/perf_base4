-- Add superadmin to user_role enum in a separate transaction
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'user_role'
        AND e.enumlabel = 'superadmin'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'superadmin';
    END IF;
END $$;