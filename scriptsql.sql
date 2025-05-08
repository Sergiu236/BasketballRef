-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BasketballRefDB')
BEGIN
    CREATE DATABASE BasketballRefDB;
END
GO

-- Use the database
USE BasketballRefDB;
GO

-- Create Users table first
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    role NVARCHAR(20) NOT NULL DEFAULT 'Regular',
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    lastLogin DATETIME2
);
GO

-- Create Referees table
CREATE TABLE Referees (
    id INT IDENTITY(1,1) PRIMARY KEY,
    firstName NVARCHAR(100) NOT NULL,
    lastName NVARCHAR(100) NOT NULL,
    league NVARCHAR(50) NOT NULL,
    age INT NOT NULL,
    grade INT NOT NULL,
    promovationDate DATE NOT NULL,
    refereedGames INT DEFAULT 0,
    t1VsT2 NVARCHAR(200),
    matchDate DATE,
    photo NVARCHAR(200) NOT NULL,
    userId INT NULL,
    CONSTRAINT FK_Referees_Users FOREIGN KEY (userId) REFERENCES Users(id)
);
GO

-- Create Games table
CREATE TABLE Games (
    id INT IDENTITY(1,1) PRIMARY KEY,
    date DATETIME2 NOT NULL,
    location NVARCHAR(200) NOT NULL,
    status NVARCHAR(20) DEFAULT 'scheduled',
    refereeId INT NOT NULL,
    createdBy INT NULL,
    updatedBy INT NULL,
    CONSTRAINT FK_Games_Referee FOREIGN KEY (refereeId) REFERENCES Referees(id) ON DELETE CASCADE,
    CONSTRAINT FK_Games_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_Games_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id)
);
GO

-- Create Logs table
CREATE TABLE Logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    action NVARCHAR(50) NOT NULL,
    entityType NVARCHAR(50) NOT NULL,
    entityId INT,
    timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    details NVARCHAR(MAX),
    FOREIGN KEY (userId) REFERENCES Users(id)
);
GO

-- Create MonitoredUsers table
CREATE TABLE MonitoredUsers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    detectedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    actionsCount INT NOT NULL,
    timeWindow INT NOT NULL, -- time window in minutes
    isActive BIT NOT NULL DEFAULT 1,
    resolvedAt DATETIME2,
    resolvedBy INT,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (resolvedBy) REFERENCES Users(id)
);
GO


--select * from Users;
--select * from Referees;
--select * from Games;
--select * from Logs;
--select * from MonitoredUsers;

SELECT * FROM Users;
SELECT * FROM Referees;
SELECT * FROM Games;
SELECT * FROM Logs;
SELECT * FROM MonitoredUsers;