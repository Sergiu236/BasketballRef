-- Migration script to add 2FA columns to Users table
-- Run this script on your database to add two-factor authentication support

-- For SQL Server (Local Development)
-- USE BasketballRefDB;
-- GO

-- Check if columns don't exist before adding them
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'twoFactorSecret')
BEGIN
    ALTER TABLE Users ADD twoFactorSecret NVARCHAR(255) NULL;
    PRINT 'Added twoFactorSecret column to Users table';
END
ELSE
BEGIN
    PRINT 'twoFactorSecret column already exists in Users table';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'twoFactorEnabled')
BEGIN
    ALTER TABLE Users ADD twoFactorEnabled BIT NOT NULL DEFAULT 0;
    PRINT 'Added twoFactorEnabled column to Users table';
END
ELSE
BEGIN
    PRINT 'twoFactorEnabled column already exists in Users table';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'twoFactorBackupCodes')
BEGIN
    ALTER TABLE Users ADD twoFactorBackupCodes NTEXT NULL;
    PRINT 'Added twoFactorBackupCodes column to Users table';
END
ELSE
BEGIN
    PRINT 'twoFactorBackupCodes column already exists in Users table';
END

-- For PostgreSQL (Production)
-- Uncomment the following lines for PostgreSQL:

/*
-- Check if columns don't exist before adding them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'twoFactorSecret') THEN
        ALTER TABLE "Users" ADD COLUMN "twoFactorSecret" VARCHAR(255) NULL;
        RAISE NOTICE 'Added twoFactorSecret column to Users table';
    ELSE
        RAISE NOTICE 'twoFactorSecret column already exists in Users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'twoFactorEnabled') THEN
        ALTER TABLE "Users" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Added twoFactorEnabled column to Users table';
    ELSE
        RAISE NOTICE 'twoFactorEnabled column already exists in Users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'twoFactorBackupCodes') THEN
        ALTER TABLE "Users" ADD COLUMN "twoFactorBackupCodes" TEXT NULL;
        RAISE NOTICE 'Added twoFactorBackupCodes column to Users table';
    ELSE
        RAISE NOTICE 'twoFactorBackupCodes column already exists in Users table';
    END IF;
END $$;
*/

PRINT 'Two-factor authentication columns migration completed successfully!'; 