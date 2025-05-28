-- PostgreSQL Migration for Render Deployment
-- This script adds 2FA columns to the Users table for PostgreSQL

-- Check if columns don't exist before adding them
DO $$
BEGIN
    -- Add twoFactorSecret column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'twoFactorSecret') THEN
        ALTER TABLE "Users" ADD COLUMN "twoFactorSecret" VARCHAR(255) NULL;
        RAISE NOTICE 'Added twoFactorSecret column to Users table';
    ELSE
        RAISE NOTICE 'twoFactorSecret column already exists in Users table';
    END IF;
    
    -- Add twoFactorEnabled column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'twoFactorEnabled') THEN
        ALTER TABLE "Users" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Added twoFactorEnabled column to Users table';
    ELSE
        RAISE NOTICE 'twoFactorEnabled column already exists in Users table';
    END IF;
    
    -- Add twoFactorBackupCodes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'twoFactorBackupCodes') THEN
        ALTER TABLE "Users" ADD COLUMN "twoFactorBackupCodes" TEXT NULL;
        RAISE NOTICE 'Added twoFactorBackupCodes column to Users table';
    ELSE
        RAISE NOTICE 'twoFactorBackupCodes column already exists in Users table';
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Users' 
AND column_name IN ('twoFactorSecret', 'twoFactorEnabled', 'twoFactorBackupCodes')
ORDER BY column_name; 