-- Fix boolean column types in PostgreSQL
-- Run this if tables were created with incorrect bit types

-- Fix LoginAttempts.successful column
DO $$
BEGIN
    -- Check if column exists and is not boolean type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'LoginAttempts' 
        AND column_name = 'successful' 
        AND data_type != 'boolean'
    ) THEN
        -- Drop and recreate with correct type
        ALTER TABLE "LoginAttempts" DROP COLUMN IF EXISTS successful;
        ALTER TABLE "LoginAttempts" ADD COLUMN successful BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Fix UserSessions.isActive column
DO $$
BEGIN
    -- Check if column exists and is not boolean type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'UserSessions' 
        AND column_name = 'isActive' 
        AND data_type != 'boolean'
    ) THEN
        -- Drop and recreate with correct type
        ALTER TABLE "UserSessions" DROP COLUMN IF EXISTS "isActive";
        ALTER TABLE "UserSessions" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Fix MonitoredUsers.isActive column
DO $$
BEGIN
    -- Check if column exists and is not boolean type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MonitoredUsers' 
        AND column_name = 'isActive' 
        AND data_type != 'boolean'
    ) THEN
        -- Drop and recreate with correct type
        ALTER TABLE "MonitoredUsers" DROP COLUMN IF EXISTS "isActive";
        ALTER TABLE "MonitoredUsers" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

SELECT 'Boolean columns fixed successfully!' as message; 