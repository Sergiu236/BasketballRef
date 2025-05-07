-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BasketballRefDB')
BEGIN
    CREATE DATABASE BasketballRefDB;
END
GO

-- Use the database
USE BasketballRefDB;
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
    photo NVARCHAR(200) NOT NULL
);
GO

-- Create Games table
CREATE TABLE Games (
    id INT IDENTITY(1,1) PRIMARY KEY,
    date DATETIME2 NOT NULL,
    location NVARCHAR(200) NOT NULL,
    status NVARCHAR(20) DEFAULT 'scheduled',
    refereeId INT NOT NULL,
    FOREIGN KEY (refereeId) REFERENCES Referees(id) ON DELETE CASCADE
);
GO
