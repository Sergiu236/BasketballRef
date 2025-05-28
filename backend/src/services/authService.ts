import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { MoreThanOrEqual, LessThan } from 'typeorm';
import { dataSource } from '../index';
import { User, UserRole } from '../entities/User';
import { UserSession } from '../entities/UserSession';
import { LoginAttempt } from '../entities/LoginAttempt';
import { Log, LogAction, EntityType } from '../entities/Log';
import { logger } from '../utils/logger';

// Configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
const LOCKOUT_TIME = parseInt(process.env.LOCKOUT_TIME || '15'); // minutes
const MAX_SESSIONS_PER_USER = parseInt(process.env.MAX_SESSIONS_PER_USER || '5');

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResult {
  success: boolean;
  user?: Omit<User, 'password'>;
  tokens?: TokenPair;
  message?: string;
  lockoutTime?: Date;
  requiresTwoFactor?: boolean;
  userId?: number; // For 2FA verification step
}

export interface SessionInfo {
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  // Helper methods to get repositories dynamically
  private static getUserRepository() {
    return dataSource.getRepository(User);
  }

  private static getSessionRepository() {
    return dataSource.getRepository(UserSession);
  }

  private static getLoginAttemptRepository() {
    return dataSource.getRepository(LoginAttempt);
  }

  private static getLogRepository() {
    return dataSource.getRepository(Log);
  }

  /**
   * Register a new user
   */
  static async register(
    username: string,
    password: string,
    email: string,
    role: string = UserRole.REGULAR,
    sessionInfo: SessionInfo = {}
  ): Promise<LoginResult> {
    try {
      // Check if user already exists
      const userRepository = this.getUserRepository();
      const existingUser = await userRepository.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Username or email already exists',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create new user
      const user = new User();
      user.username = username;
      user.password = hashedPassword;
      user.email = email;
      user.role = role === 'Admin' ? UserRole.ADMIN : UserRole.REGULAR;
      user.lastLogin = new Date();

      const savedUser = await userRepository.save(user);

      // Log the registration
      await this.logUserAction(savedUser.id, LogAction.REGISTER, `User ${username} registered`);

      // Generate tokens and create session
      const tokens = await this.generateTokens(savedUser, sessionInfo);

      // Return user without password
      const { password: _, ...userWithoutPassword } = savedUser;
      
      return {
        success: true,
        user: userWithoutPassword,
        tokens,
        message: 'User registered successfully',
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Login user with enhanced security
   */
  static async login(
    username: string,
    password: string,
    sessionInfo: SessionInfo = {}
  ): Promise<LoginResult> {
    try {
      // Check for account lockout
      const isLockedOut = await this.isAccountLockedOut(username, sessionInfo.ipAddress || '');
      if (isLockedOut.locked) {
        return {
          success: false,
          message: 'Account temporarily locked due to too many failed attempts',
          lockoutTime: isLockedOut.lockoutTime,
        };
      }

      // Find user
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({
        where: { username },
      });

      if (!user) {
        await this.recordLoginAttempt(username, sessionInfo.ipAddress || '', sessionInfo.userAgent, false, 'User not found');
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.recordLoginAttempt(username, sessionInfo.ipAddress || '', sessionInfo.userAgent, false, 'Invalid password');
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Don't generate tokens yet, require 2FA verification
        await this.recordLoginAttempt(username, sessionInfo.ipAddress || '', sessionInfo.userAgent, true, 'Password verified, awaiting 2FA');
        
        return {
          success: true,
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Two-factor authentication required',
        };
      }

      // Successful login without 2FA - clear failed attempts
      await this.clearFailedAttempts(username, sessionInfo.ipAddress || '');
      await this.recordLoginAttempt(username, sessionInfo.ipAddress || '', sessionInfo.userAgent, true);

      // Update last login time
      user.lastLogin = new Date();
      await userRepository.save(user);

      // Log the login
      await this.logUserAction(user.id, LogAction.LOGIN, `User ${username} logged in`);

      // Clean up old sessions and generate new tokens
      await this.cleanupUserSessions(user.id);
      const tokens = await this.generateTokens(user, sessionInfo);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword,
        tokens,
        message: 'Login successful',
      };
    } catch (error) {
      logger.error('Error logging in:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string, sessionInfo: SessionInfo = {}): Promise<TokenPair | null> {
    try {
      // Find session by refresh token (no need to verify as JWT since it's a random string)
      const sessionRepository = this.getSessionRepository();
      const session = await sessionRepository.findOne({
        where: { refreshToken, isActive: true },
        relations: ['user'],
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      // Update session last used time
      session.lastUsedAt = new Date();
      if (sessionInfo.ipAddress) session.ipAddress = sessionInfo.ipAddress;
      if (sessionInfo.userAgent) session.userAgent = sessionInfo.userAgent;
      
      // Generate new access token
      const accessToken = jwt.sign(
        { 
          id: session.user.id, 
          username: session.user.username, 
          role: session.user.role,
          sessionId: session.id
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      session.accessToken = accessToken;
      await sessionRepository.save(session);

      return {
        accessToken,
        refreshToken: session.refreshToken,
        expiresIn: JWT_EXPIRES_IN,
      };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Logout user and invalidate session
   */
  static async logout(refreshToken: string): Promise<boolean> {
    try {
      const sessionRepository = this.getSessionRepository();
      const session = await sessionRepository.findOne({
        where: { refreshToken },
        relations: ['user'],
      });

      if (session) {
        session.isActive = false;
        await sessionRepository.save(session);
        
        // Log the logout
        await this.logUserAction(session.user.id, LogAction.LOGIN, `User ${session.user.username} logged out`);
        
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error logging out:', error);
      return false;
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAllDevices(userId: number): Promise<boolean> {
    try {
      const sessionRepository = this.getSessionRepository();
      await sessionRepository.update(
        { userId, isActive: true },
        { isActive: false }
      );
      
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });
      if (user) {
        await this.logUserAction(userId, LogAction.LOGIN, `User ${user.username} logged out from all devices`);
      }
      
      return true;
    } catch (error) {
      logger.error('Error logging out from all devices:', error);
      return false;
    }
  }

  /**
   * Get user's active sessions
   */
  static async getUserSessions(userId: number): Promise<UserSession[]> {
    try {
      const sessionRepository = this.getSessionRepository();
      return await sessionRepository.find({
        where: { userId, isActive: true },
        order: { lastUsedAt: 'DESC' },
      });
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(sessionId: number, userId: number): Promise<boolean> {
    try {
      const sessionRepository = this.getSessionRepository();
      const result = await sessionRepository.update(
        { id: sessionId, userId, isActive: true },
        { isActive: false }
      );
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      logger.error('Error revoking session:', error);
      return false;
    }
  }

  /**
   * Verify access token and get user info
   */
  static async verifyAccessToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if session is still active
      if (decoded.sessionId) {
        const sessionRepository = this.getSessionRepository();
        const session = await sessionRepository.findOne({
          where: { id: decoded.sessionId, isActive: true },
        });
        
        if (!session) {
          return null;
        }
      }
      
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate token pair and create session
   */
  private static async generateTokens(user: User, sessionInfo: SessionInfo = {}): Promise<TokenPair> {
    try {
      // TEMPORARY FIX: Use shorter refresh token to avoid PostgreSQL column limit (100 chars)
      const refreshToken = crypto.randomBytes(32).toString('hex'); // 64 characters
      
      console.log(`🔧 [AUTH] Generated refresh token length: ${refreshToken.length}`);
      
      // TEMPORARY FIX: Truncate userAgent and deviceInfo to avoid PostgreSQL column limits
      const truncatedUserAgent = sessionInfo.userAgent ? sessionInfo.userAgent.substring(0, 95) : null;
      const truncatedDeviceInfo = sessionInfo.deviceInfo ? sessionInfo.deviceInfo.substring(0, 95) : null;
      
      console.log(`🔧 [AUTH] Original userAgent length: ${sessionInfo.userAgent?.length || 0}, truncated: ${truncatedUserAgent?.length || 0}`);
      console.log(`🔧 [AUTH] Original deviceInfo length: ${sessionInfo.deviceInfo?.length || 0}, truncated: ${truncatedDeviceInfo?.length || 0}`);
      
      // Create session first
      const session = new UserSession();
      session.userId = user.id;
      session.refreshToken = refreshToken;
      session.deviceInfo = truncatedDeviceInfo;
      session.ipAddress = sessionInfo.ipAddress || null;
      session.userAgent = truncatedUserAgent;
      session.expiresAt = new Date(Date.now() + this.parseTimeToMs(JWT_REFRESH_EXPIRES_IN));
      session.lastUsedAt = new Date();

      const sessionRepository = this.getSessionRepository();
      const savedSession = await sessionRepository.save(session);

      // Generate access token with session ID
      const accessToken = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          role: user.role,
          sessionId: savedSession.id
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      console.log(`🔧 [AUTH] Generated access token length: ${accessToken.length}`);

      // Update session with access token
      savedSession.accessToken = accessToken;
      await sessionRepository.save(savedSession);

      return {
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN,
      };
    } catch (error) {
      logger.error('Error generating tokens:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Clean up old sessions for user
   */
  private static async cleanupUserSessions(userId: number): Promise<void> {
    const sessionRepository = this.getSessionRepository();
    const activeSessions = await sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastUsedAt: 'DESC' },
    });

    if (activeSessions.length >= MAX_SESSIONS_PER_USER) {
      const sessionsToDeactivate = activeSessions.slice(MAX_SESSIONS_PER_USER - 1);
      for (const session of sessionsToDeactivate) {
        session.isActive = false;
        await sessionRepository.save(session);
      }
    }
  }

  /**
   * Check if account is locked out
   */
  private static async isAccountLockedOut(username: string, ipAddress: string): Promise<{ locked: boolean; lockoutTime?: Date }> {
    const lockoutTime = new Date(Date.now() - LOCKOUT_TIME * 60 * 1000);
    
    const loginAttemptRepository = this.getLoginAttemptRepository();
    const recentFailedAttempts = await loginAttemptRepository.count({
      where: {
        username,
        ipAddress,
        successful: false,
        attemptedAt: MoreThanOrEqual(lockoutTime),
      },
    });

    if (recentFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lastAttempt = await loginAttemptRepository.findOne({
        where: { username, ipAddress, successful: false },
        order: { attemptedAt: 'DESC' },
      });

      if (lastAttempt) {
        const unlockTime = new Date(lastAttempt.attemptedAt.getTime() + LOCKOUT_TIME * 60 * 1000);
        return { locked: true, lockoutTime: unlockTime };
      }
    }

    return { locked: false };
  }

  /**
   * Record login attempt
   */
  private static async recordLoginAttempt(
    username: string,
    ipAddress: string,
    userAgent: string | undefined,
    successful: boolean,
    failureReason?: string
  ): Promise<void> {
    const attempt = new LoginAttempt();
    attempt.username = username;
    attempt.ipAddress = ipAddress;
    attempt.userAgent = userAgent || null;
    attempt.successful = successful;
    attempt.failureReason = failureReason || null;

    const loginAttemptRepository = this.getLoginAttemptRepository();
    await loginAttemptRepository.save(attempt);
  }

  /**
   * Clear failed attempts after successful login
   */
  private static async clearFailedAttempts(username: string, ipAddress: string): Promise<void> {
    const loginAttemptRepository = this.getLoginAttemptRepository();
    await loginAttemptRepository.delete({
      username,
      ipAddress,
      successful: false,
    });
  }

  /**
   * Log user action
   */
  private static async logUserAction(userId: number, action: LogAction, details: string): Promise<void> {
    const log = new Log();
    log.userId = userId;
    log.action = action;
    log.entityType = EntityType.USER;
    log.entityId = userId;
    log.details = details;
    
    const logRepository = this.getLogRepository();
    await logRepository.save(log);
  }

  /**
   * Parse time string to milliseconds
   */
  private static parseTimeToMs(timeStr: string): number {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return value;
    }
  }

  /**
   * Clean up expired sessions (should be called periodically)
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const sessionRepository = this.getSessionRepository();
      await sessionRepository.update(
        { expiresAt: LessThan(new Date()), isActive: true },
        { isActive: false }
      );
      
      // Delete old inactive sessions (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await sessionRepository.delete({
        isActive: false,
        updatedAt: LessThan(thirtyDaysAgo),
      });
      
      logger.info('Cleaned up expired sessions');
    } catch (error) {
      logger.error('Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Complete login after 2FA verification
   */
  static async completeTwoFactorLogin(
    userId: number,
    sessionInfo: SessionInfo = {}
  ): Promise<LoginResult> {
    try {
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Clear failed attempts and record successful login
      await this.clearFailedAttempts(user.username, sessionInfo.ipAddress || '');
      await this.recordLoginAttempt(user.username, sessionInfo.ipAddress || '', sessionInfo.userAgent, true, '2FA verified');

      // Update last login time
      user.lastLogin = new Date();
      await userRepository.save(user);

      // Log the login
      await this.logUserAction(user.id, LogAction.LOGIN, `User ${user.username} logged in with 2FA`);

      // Clean up old sessions and generate new tokens
      await this.cleanupUserSessions(user.id);
      const tokens = await this.generateTokens(user, sessionInfo);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        success: true,
        user: userWithoutPassword,
        tokens,
        message: 'Login successful with two-factor authentication',
      };
    } catch (error) {
      logger.error('Error completing 2FA login:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }
} 