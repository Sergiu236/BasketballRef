import { Request, Response } from 'express';
import { AuthService, SessionInfo } from '../services/authService';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Extract session info from request
 */
function getSessionInfo(req: Request): SessionInfo {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    deviceInfo: req.get('X-Device-Info') || undefined,
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const sessionInfo = getSessionInfo(req);
    const result = await AuthService.register(username, password, email, role, sessionInfo);

    if (!result.success) {
      return res.status(result.message === 'Username or email already exists' ? 409 : 400)
        .json({ success: false, message: result.message });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      user: result.user,
      tokens: {
        accessToken: result.tokens?.accessToken,
        refreshToken: result.tokens?.refreshToken,
        expiresIn: result.tokens?.expiresIn,
      },
    });
  } catch (error) {
    logger.error('Error in register controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Missing username or password' });
    }

    const sessionInfo = getSessionInfo(req);
    const result = await AuthService.login(username, password, sessionInfo);

    if (!result.success) {
      const statusCode = result.lockoutTime ? 423 : 401; // 423 = Locked
      return res.status(statusCode).json({ 
        success: false,
        message: result.message,
        lockoutTime: result.lockoutTime 
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      user: result.user,
      tokens: {
        accessToken: result.tokens?.accessToken,
        refreshToken: result.tokens?.refreshToken,
        expiresIn: result.tokens?.expiresIn,
      },
    });
  } catch (error) {
    logger.error('Error in login controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const sessionInfo = getSessionInfo(req);
    const tokens = await AuthService.refreshToken(refreshToken, sessionInfo);

    if (!tokens) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    logger.error('Error in refresh token controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const success = await AuthService.logout(refreshToken);

    if (!success) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Error in logout controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logoutAllDevices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const success = await AuthService.logoutAllDevices(req.user.id);

    if (!success) {
      return res.status(500).json({ error: 'Failed to logout from all devices' });
    }

    return res.status(200).json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    logger.error('Error in logout all devices controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessions = await AuthService.getUserSessions(req.user.id);

    // Remove sensitive information before sending
    const safeSessions = sessions.map(session => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      isActive: session.isActive,
    }));

    return res.status(200).json({ sessions: safeSessions });
  } catch (error) {
    logger.error('Error in get sessions controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const revokeSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const success = await AuthService.revokeSession(parseInt(sessionId), req.user.id);

    if (!success) {
      return res.status(404).json({ error: 'Session not found or already revoked' });
    }

    return res.status(200).json({ message: 'Session revoked successfully' });
  } catch (error) {
    logger.error('Error in revoke session controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Return user profile information
    return res.status(200).json({
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      }
    });
  } catch (error) {
    logger.error('Error in get profile controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 