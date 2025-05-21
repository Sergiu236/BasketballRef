# User Monitoring Infrastructure

This document describes the user monitoring infrastructure implemented in the BasketballRef application.

## Features Implemented

1. **Authentication System**
   - User registration and login functionality
   - JWT-based authentication
   - Password hashing with bcrypt

2. **User Roles**
   - Regular User: Can manage their own referees
   - Admin: Can access all referees and monitoring features

3. **Logging System**
   - Tracks all CRUD operations in a dedicated logs table
   - Logs include user information, action type, entity affected, timestamps, and details

4. **Background Monitoring Thread**
   - Periodically analyzes log table for suspicious activity
   - Detects high-frequency actions within a specified time window
   - Adds flagged users to a monitored users list

5. **Admin Dashboard**
   - Monitored users list with detailed information
   - System logs viewer
   - Ability to resolve monitoring flags

## Setup Instructions

### 1. Database Setup

First, run the provided SQL script to create the necessary tables:

```sql
-- Run the SQL script
scriptsql.sql
```

### 2. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Application

```bash
# Start the backend
cd backend
npm run dev

# Start the frontend in a new terminal
cd frontend
npm run dev
```

## Testing the Implementation

### 1. Register Users

- Register an admin user:
  - Navigate to `/register`
  - Create an account with username `admin`, set a password and email
  - In the database, update this user's role to 'Admin' manually:
  ```sql
  UPDATE Users SET role = 'Admin' WHERE username = 'admin';
  ```

- Register a regular user:
  - Navigate to `/register`
  - Create an account with any username/password

### 2. Testing Permissions

- Login as a regular user:
  - Create, update, and delete referees
  - Verify you can only see and modify your own referees

- Login as admin:
  - Verify you can see all referees created by all users
  - Verify you can access `/admin` route to see the admin dashboard

### 3. Simulating Suspicious Activity

To simulate suspicious activity and trigger the monitoring system:

1. Login as a regular user
2. Perform a high number of operations in a short time:
   - Create multiple referees (15+)
   - Update/delete some of them
   - These actions will be logged in the database

3. Wait for the monitoring thread to detect the activity (runs every minute)
4. Login as admin and check the monitored users list:
   - Navigate to `/admin/monitored-users`
   - You should see the suspicious user listed

5. View user logs:
   - Click "View Logs" to see the detailed activity log

6. Resolve the monitoring:
   - Click "Resolve" to mark the monitoring as resolved

## Configuration

The monitoring system can be adjusted by modifying the constants in `backend/src/services/monitoringService.ts`:

- `SUSPICIOUS_ACTIONS_THRESHOLD`: The number of actions to trigger monitoring
- `TIME_WINDOW_MINUTES`: The time window (in minutes) for detecting suspicious activity

## Architecture

- **Frontend**: React with TypeScript, React Router, and custom services
- **Backend**: Node.js with Express, TypeORM
- **Database**: SQL Server with tables for Users, Logs, and MonitoredUsers
- **Authentication**: JWT-based authentication with protected routes
- **Background Process**: Monitoring thread that checks for suspicious activity 