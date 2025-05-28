import { Request, Response } from 'express';
import { TwoFactorService } from '../services/twoFactorService';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

function getSessionInfo(req: Request) {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || '',
    userAgent: req.get('User-Agent') || '',
    deviceInfo: req.get('User-Agent') || '',
  };
}

/**
 * Generate 2FA setup (QR code and backup codes)
 */
export const generateSetup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔧 [2FA DEBUG] generateSetup called');
    console.log('🔧 [2FA DEBUG] User from request:', req.user);
    console.log('🔧 [2FA DEBUG] Request headers:', req.headers);
    
    if (!req.user) {
      console.log('❌ [2FA DEBUG] No user in request - authentication failed');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    console.log(`🔧 [2FA DEBUG] Generating setup for user ID: ${req.user.id}`);
    const result = await TwoFactorService.generateSetup(req.user.id);
    console.log('🔧 [2FA DEBUG] TwoFactorService.generateSetup result:', result);

    if (!result.success) {
      console.log('❌ [2FA DEBUG] Setup generation failed:', result.message);
      return res.status(400).json({ success: false, message: result.message });
    }

    console.log('✅ [2FA DEBUG] Setup generation successful, sending response');
    return res.status(200).json({
      success: true,
      message: result.message,
      qrCodeUrl: result.qrCodeUrl,
      backupCodes: result.backupCodes,
    });
  } catch (error) {
    console.error('💥 [2FA DEBUG] Error in generateSetup controller:', error);
    logger.error('Error in generateSetup controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Enable 2FA after verifying the setup token
 */
export const enableTwoFactor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const result = await TwoFactorService.enableTwoFactor(req.user.id, token);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('Error in enableTwoFactor controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Verify 2FA token during login and complete the login process
 */
export const verifyTwoFactor = async (req: Request, res: Response) => {
  try {
    console.log('🔧 [2FA CONTROLLER] verifyTwoFactor called');
    console.log('🔧 [2FA CONTROLLER] Request body:', req.body);
    
    const { userId, token } = req.body;

    if (!userId || !token) {
      console.log('❌ [2FA CONTROLLER] Missing userId or token');
      return res.status(400).json({ success: false, message: 'User ID and token are required' });
    }

    console.log(`🔧 [2FA CONTROLLER] Verifying 2FA for userId: ${userId}, token: ${token}`);

    // First verify the 2FA token
    console.log('🔧 [2FA CONTROLLER] Calling TwoFactorService.verifyTwoFactor...');
    const verificationResult = await TwoFactorService.verifyTwoFactor(userId, token);
    console.log('🔧 [2FA CONTROLLER] TwoFactorService.verifyTwoFactor result:', verificationResult);

    if (!verificationResult.success) {
      console.log('❌ [2FA CONTROLLER] 2FA verification failed:', verificationResult.message);
      return res.status(400).json({ success: false, message: verificationResult.message });
    }

    console.log('✅ [2FA CONTROLLER] 2FA verification successful, completing login...');

    // If 2FA verification successful, complete the login
    const sessionInfo = getSessionInfo(req);
    console.log('🔧 [2FA CONTROLLER] Session info:', sessionInfo);
    console.log('🔧 [2FA CONTROLLER] Calling AuthService.completeTwoFactorLogin...');
    
    const loginResult = await AuthService.completeTwoFactorLogin(userId, sessionInfo);
    console.log('🔧 [2FA CONTROLLER] AuthService.completeTwoFactorLogin result:', loginResult);

    if (!loginResult.success) {
      console.log('❌ [2FA CONTROLLER] Failed to complete login after 2FA verification:', loginResult.message);
      return res.status(500).json({ success: false, message: 'Failed to complete login after 2FA verification' });
    }

    console.log('✅ [2FA CONTROLLER] Login completed successfully, sending response');
    return res.status(200).json({
      success: true,
      message: loginResult.message,
      user: loginResult.user,
      tokens: {
        accessToken: loginResult.tokens?.accessToken,
        refreshToken: loginResult.tokens?.refreshToken,
        expiresIn: loginResult.tokens?.expiresIn,
      },
      backupCodeUsed: verificationResult.backupCodeUsed,
    });
  } catch (error) {
    console.error('💥 [2FA CONTROLLER] Error in verifyTwoFactor controller:', error);
    logger.error('Error in verifyTwoFactor controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Disable 2FA
 */
export const disableTwoFactor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }

    const result = await TwoFactorService.disableTwoFactor(req.user.id, currentPassword);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('Error in disableTwoFactor controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get 2FA status for the current user
 */
export const getTwoFactorStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔧 [2FA DEBUG] getTwoFactorStatus called');
    console.log('🔧 [2FA DEBUG] User from request:', req.user);
    
    if (!req.user) {
      console.log('❌ [2FA DEBUG] No user in request - authentication failed');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    console.log(`🔧 [2FA DEBUG] Getting status for user ID: ${req.user.id}`);
    const status = await TwoFactorService.getTwoFactorStatus(req.user.id);
    console.log('🔧 [2FA DEBUG] TwoFactorService.getTwoFactorStatus result:', status);

    console.log('✅ [2FA DEBUG] Status retrieved successfully, sending response');
    return res.status(200).json({
      success: true,
      enabled: status.enabled,
      hasSecret: status.hasSecret,
    });
  } catch (error) {
    console.error('💥 [2FA DEBUG] Error in getTwoFactorStatus controller:', error);
    logger.error('Error in getTwoFactorStatus controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await TwoFactorService.regenerateBackupCodes(req.user.id);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      backupCodes: result.backupCodes,
    });
  } catch (error) {
    logger.error('Error in regenerateBackupCodes controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 