-- Quick check to see what databases and tables exist
-- Run this in SQL Server Management Studio

-- Check if BasketballRefDB database exists
SELECT name FROM sys.databases WHERE name = 'BasketballRefDB';

-- If the database exists, use it and check tables
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'BasketballRefDB')
BEGIN
    USE BasketballRefDB;
    
    -- List all tables in the database
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME;
    
    -- Check if Users table exists and has data
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
    BEGIN
        SELECT COUNT(*) as UserCount FROM Users;
        SELECT TOP 5 id, username, email, role FROM Users;
    END
    ELSE
    BEGIN
        PRINT 'Users table does not exist!';
    END
END
ELSE
BEGIN
    PRINT 'BasketballRefDB database does not exist!';
    PRINT 'You need to run the scriptsql.sql script first.';
END 