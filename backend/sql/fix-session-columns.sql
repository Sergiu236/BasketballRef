-- PostgreSQL Migration to fix UserSessions table column lengths
-- This script fixes the column lengths to match the TypeORM entity definitions

-- Fix refreshToken column length (from 100 to 500)
ALTER TABLE "UserSessions" ALTER COLUMN "refreshToken" TYPE VARCHAR(500);

-- Fix accessToken column length (ensure it's 500)
ALTER TABLE "UserSessions" ALTER COLUMN "accessToken" TYPE VARCHAR(500);

-- Fix userAgent column length (ensure it's 500)  
ALTER TABLE "UserSessions" ALTER COLUMN "userAgent" TYPE VARCHAR(500);

-- Verify the changes
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'UserSessions' 
AND column_name IN ('refreshToken', 'accessToken', 'userAgent', 'deviceInfo', 'ipAddress')
ORDER BY column_name; 