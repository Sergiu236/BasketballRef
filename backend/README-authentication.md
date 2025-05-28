# JWT Authentication System

This document describes the JWT authentication system implemented for the Basketball Referee application.

## Features

- **JWT Access Tokens**: Short-lived tokens (15 minutes default) for API access
- **Refresh Tokens**: Long-lived tokens (7 days default) for token renewal
- **Session Management**: Track user sessions across multiple devices
- **Security Features**: 
  - Account lockout after failed login attempts
  - Session cleanup and management
  - IP address and user agent tracking
  - Secure password hashing with bcrypt

## Environment Configuration

Copy `env.example` to `.env` and configure the following variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=15
MAX_SESSIONS_PER_USER=5
```

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123",
  "email": "john@example.com",
  "role": "Regular" // or "Admin"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

### Protected Endpoints (Require Authentication)

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer your-access-token-here
```

#### Get Active Sessions
```http
GET /api/auth/sessions
Authorization: Bearer your-access-token-here
```

#### Logout from All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer your-access-token-here
```

#### Revoke Specific Session
```http
DELETE /api/auth/sessions/:sessionId
Authorization: Bearer your-access-token-here
```

## Database Schema

### UserSessions Table
- `id`: Primary key
- `userId`: Foreign key to Users table
- `refreshToken`: Unique refresh token
- `accessToken`: Current access token
- `deviceInfo`: Device information (optional)
- `ipAddress`: IP address of the session
- `userAgent`: Browser/client user agent
- `expiresAt`: Refresh token expiration date
- `isActive`: Session status
- `lastUsedAt`: Last activity timestamp

### LoginAttempts Table
- `id`: Primary key
- `username`: Username attempted
- `ipAddress`: IP address of attempt
- `userAgent`: Browser/client user agent
- `successful`: Whether attempt was successful
- `failureReason`: Reason for failure (if any)
- `attemptedAt`: Timestamp of attempt

## Usage Examples

### Frontend Integration

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const { accessToken, refreshToken, user } = await loginResponse.json();

// Store tokens securely
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Make authenticated requests
const apiResponse = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Refresh token when access token expires
const refreshResponse = await fetch('/api/auth/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken: newAccessToken } = await refreshResponse.json();
```

## Security Considerations

1. **Token Storage**: Store tokens securely on the client side
2. **HTTPS**: Always use HTTPS in production
3. **Environment Variables**: Keep JWT secrets secure and rotate them regularly
4. **Session Limits**: Configure appropriate session limits per user
5. **Monitoring**: Monitor failed login attempts and suspicious activity

## Database Compatibility

The system works with both:
- **Local Development**: SQL Server with Windows Authentication
- **Production**: PostgreSQL on Render

The database configuration automatically switches based on the `NODE_ENV` environment variable.

## Troubleshooting

### Common Issues

1. **Token Expired**: Use refresh token to get new access token
2. **Account Locked**: Wait for lockout period to expire or contact admin
3. **Invalid Credentials**: Check username and password
4. **Session Limit Reached**: Old sessions are automatically cleaned up

### Logs

Check the application logs for authentication-related errors:
- Failed login attempts
- Token verification failures
- Session cleanup activities 