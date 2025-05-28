-- Script to check if 2FA columns exist in Users table

-- For SQL Server
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' 
AND COLUMN_NAME IN ('twoFactorSecret', 'twoFactorEnabled', 'twoFactorBackupCodes')
ORDER BY COLUMN_NAME;

-- Expected output should show 3 rows:
-- twoFactorSecret (nvarchar, nullable)
-- twoFactorEnabled (bit, not nullable, default 0)
-- twoFactorBackupCodes (ntext, nullable) 