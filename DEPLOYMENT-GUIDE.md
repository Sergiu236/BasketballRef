# 🚀 Basketball Referee App - Deployment Guide

## 📋 Prerequisites for Production Deployment

### 1. **Environment Setup**
- Node.js 18+ 
- PostgreSQL 14+
- Git

### 2. **Environment Variables**
Create a `.env` file in the backend directory with:

```env
# Database Configuration
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=15
MAX_SESSIONS_PER_USER=5

# Server Configuration
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🗄️ Database Setup (PostgreSQL)

### 1. **Create Database**
```sql
CREATE DATABASE basketballref;
```

### 2. **Run Migration Scripts**
Execute the following SQL files in order:

```bash
# 1. Create main tables
psql -d basketballref -f backend/sql/create-auth-tables-postgresql.sql

# 2. Insert initial data (if needed)
# Add any seed data here
```

### 3. **Verify Tables**
Check that all tables are created:
```sql
\dt
```

Expected tables:
- Users
- UserSessions  
- LoginAttempts
- Referees
- Games
- Logs
- MonitoredUsers

## 🔧 Backend Deployment

### 1. **Install Dependencies**
```bash
cd backend
npm install --production
```

### 2. **Build TypeScript**
```bash
npm run build
```

### 3. **Start Production Server**
```bash
npm start
```

## 🌐 Frontend Deployment

### 1. **Update Configuration**
Update `frontend/src/config.ts`:
```typescript
const config = {
  API_URL: 'https://your-backend-domain.com', // Your backend URL
};
```

### 2. **Build for Production**
```bash
cd frontend
npm install
npm run build
```

### 3. **Deploy Static Files**
Upload the `build/` folder to your static hosting service (Netlify, Vercel, etc.)

## 🔐 Security Checklist

### ✅ **Environment Variables**
- [ ] JWT secrets are strong and unique
- [ ] Database credentials are secure
- [ ] CORS origin is set to your frontend domain
- [ ] All sensitive data is in environment variables

### ✅ **Database Security**
- [ ] Database user has minimal required permissions
- [ ] Database is not publicly accessible
- [ ] SSL/TLS is enabled for database connections
- [ ] Regular backups are configured

### ✅ **Application Security**
- [ ] HTTPS is enabled
- [ ] Rate limiting is configured
- [ ] Session management is working
- [ ] Account lockout is functional

## 📊 Monitoring & Maintenance

### **Health Checks**
- Monitor `/api/health` endpoint
- Check database connectivity
- Monitor session cleanup service
- Track failed login attempts

### **Regular Tasks**
- Review user sessions weekly
- Monitor suspicious login attempts
- Update dependencies monthly
- Backup database daily

## 🚨 Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration times
   - Ensure session table exists

3. **CORS Errors**
   - Update CORS_ORIGIN in backend
   - Check frontend API_URL configuration

### **Logs Location**
- Application logs: Check your hosting platform logs
- Database logs: PostgreSQL logs directory
- Error tracking: Consider adding Sentry or similar

## 📈 Performance Optimization

### **Database Optimization**
- Add indexes on frequently queried columns
- Regular VACUUM and ANALYZE
- Monitor query performance

### **Application Optimization**
- Enable gzip compression
- Use CDN for static assets
- Implement caching where appropriate

## 🔄 Updates & Migrations

### **Updating the Application**
1. Backup database
2. Deploy new backend version
3. Run any new migrations
4. Deploy new frontend version
5. Test critical functionality

### **Database Migrations**
- Always backup before migrations
- Test migrations on staging first
- Have rollback plan ready

---

## 🎯 **Your JWT Authentication System Features**

✅ **Complete JWT Implementation**
- Access tokens (15 min expiry)
- Refresh tokens (7 day expiry)
- Automatic token rotation

✅ **Session Management**
- Multi-device support
- Session tracking with IP/device info
- Manual session revocation
- Automatic cleanup

✅ **Security Features**
- Account lockout after failed attempts
- Password hashing with bcrypt
- Rate limiting
- Secure session storage

✅ **User Experience**
- Seamless login/logout
- Session management UI
- Automatic token refresh
- Cross-device session control

**Your application fully satisfies the JWT authentication requirements!** 🚀 