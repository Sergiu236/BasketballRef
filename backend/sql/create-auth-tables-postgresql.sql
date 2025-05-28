-- PostgreSQL script to create authentication tables
-- This will be automatically executed on Render deployment

-- Create UserSessions table
CREATE TABLE IF NOT EXISTS "UserSessions" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "refreshToken" VARCHAR(500) NOT NULL UNIQUE,
    "accessToken" VARCHAR(500),
    "deviceInfo" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "expiresAt" TIMESTAMP NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "FK_UserSessions_Users" FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE
);

-- Create indexes for UserSessions
CREATE INDEX IF NOT EXISTS "IX_UserSessions_userId" ON "UserSessions"("userId");
CREATE INDEX IF NOT EXISTS "IX_UserSessions_refreshToken" ON "UserSessions"("refreshToken");

-- Create LoginAttempts table
CREATE TABLE IF NOT EXISTS "LoginAttempts" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    successful BOOLEAN NOT NULL DEFAULT false,
    "failureReason" VARCHAR(255),
    "attemptedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for LoginAttempts
CREATE INDEX IF NOT EXISTS "IX_LoginAttempts_username" ON "LoginAttempts"(username);
CREATE INDEX IF NOT EXISTS "IX_LoginAttempts_ipAddress" ON "LoginAttempts"("ipAddress");
CREATE INDEX IF NOT EXISTS "IX_LoginAttempts_attemptedAt" ON "LoginAttempts"("attemptedAt");

-- Create function to update updatedAt column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON "UserSessions";
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON "UserSessions"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your database user)
-- GRANT ALL PRIVILEGES ON TABLE "UserSessions" TO your_db_user;
-- GRANT ALL PRIVILEGES ON TABLE "LoginAttempts" TO your_db_user;
-- GRANT USAGE, SELECT ON SEQUENCE "UserSessions_id_seq" TO your_db_user;
-- GRANT USAGE, SELECT ON SEQUENCE "LoginAttempts_id_seq" TO your_db_user;

SELECT 'Authentication tables setup completed for PostgreSQL!' as message; 