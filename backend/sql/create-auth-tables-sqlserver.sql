-- SQL Server script to create authentication tables
-- Run this on your local SQL Server database

USE BasketballRefDB;
GO

-- Create UserSessions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserSessions' AND xtype='U')
BEGIN
    CREATE TABLE UserSessions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        refreshToken NVARCHAR(500) NOT NULL UNIQUE,
        accessToken NVARCHAR(500) NULL,
        deviceInfo NVARCHAR(100) NULL,
        ipAddress NVARCHAR(45) NULL,
        userAgent NVARCHAR(500) NULL,
        expiresAt DATETIME2 NOT NULL,
        isActive BIT NOT NULL DEFAULT 1,
        lastUsedAt DATETIME2 NULL,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_UserSessions_Users FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
    );
    
    -- Create indexes
    CREATE INDEX IX_UserSessions_userId ON UserSessions(userId);
    CREATE INDEX IX_UserSessions_refreshToken ON UserSessions(refreshToken);
    
    PRINT 'UserSessions table created successfully';
END
ELSE
BEGIN
    PRINT 'UserSessions table already exists';
END

-- Create LoginAttempts table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LoginAttempts' AND xtype='U')
BEGIN
    CREATE TABLE LoginAttempts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(100) NOT NULL,
        ipAddress NVARCHAR(45) NOT NULL,
        userAgent NVARCHAR(500) NULL,
        successful BIT NOT NULL DEFAULT 0,
        failureReason NVARCHAR(255) NULL,
        attemptedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Create indexes
    CREATE INDEX IX_LoginAttempts_username ON LoginAttempts(username);
    CREATE INDEX IX_LoginAttempts_ipAddress ON LoginAttempts(ipAddress);
    CREATE INDEX IX_LoginAttempts_attemptedAt ON LoginAttempts(attemptedAt);
    
    PRINT 'LoginAttempts table created successfully';
END
ELSE
BEGIN
    PRINT 'LoginAttempts table already exists';
END

-- Create trigger to update updatedAt column for UserSessions
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_UserSessions_UpdatedAt')
BEGIN
    EXEC('
    CREATE TRIGGER TR_UserSessions_UpdatedAt
    ON UserSessions
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE UserSessions 
        SET updatedAt = GETDATE()
        FROM UserSessions u
        INNER JOIN inserted i ON u.id = i.id;
    END
    ');
    
    PRINT 'UserSessions update trigger created successfully';
END
ELSE
BEGIN
    PRINT 'UserSessions update trigger already exists';
END

PRINT 'Authentication tables setup completed for SQL Server!'; 