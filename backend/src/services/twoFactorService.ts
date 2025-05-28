import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { dataSource } from '../index';
import { User } from '../entities/User';
import { Log, LogAction, EntityType } from '../entities/Log';
import { logger } from '../utils/logger';

export interface TwoFactorSetupResult {
  success: boolean;
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
  message?: string;
}

export interface TwoFactorVerificationResult {
  success: boolean;
  message?: string;
  backupCodeUsed?: boolean;
}

export class TwoFactorService {
  private static getUserRepository() {
    return dataSource.getRepository(User);
  }

  private static getLogRepository() {
    return dataSource.getRepository(Log);
  }

  /**
   * Generate a new 2FA secret and QR code for setup
   */
  static async generateSetup(userId: number, appName: string = 'BasketballRef'): Promise<TwoFactorSetupResult> {
    try {
      console.log(`🔧 [2FA SERVICE] generateSetup called for userId: ${userId}`);
      
      const userRepository = this.getUserRepository();
      console.log('🔧 [2FA SERVICE] Got user repository');
      
      const user = await userRepository.findOne({ where: { id: userId } });
      console.log('🔧 [2FA SERVICE] User query result:', user ? `Found user: ${user.username}` : 'User not found');

      if (!user) {
        console.log('❌ [2FA SERVICE] User not found in database');
        return {
          success: false,
          message: 'User not found',
        };
      }

      console.log('🔧 [2FA SERVICE] Generating speakeasy secret...');
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${appName} (${user.username})`,
        issuer: appName,
        length: 32,
      });
      console.log('🔧 [2FA SERVICE] Secret generated successfully');

      console.log('🔧 [2FA SERVICE] Generating QR code...');
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
      console.log('🔧 [2FA SERVICE] QR code generated successfully');

      console.log('🔧 [2FA SERVICE] Generating backup codes...');
      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      console.log('🔧 [2FA SERVICE] Backup codes generated:', backupCodes.length, 'codes');

      console.log('🔧 [2FA SERVICE] Updating user with 2FA data...');
      // Store the secret temporarily (not enabled yet)
      user.twoFactorSecret = secret.base32;
      user.twoFactorBackupCodes = JSON.stringify(backupCodes);
      
      try {
        await userRepository.save(user);
        console.log('✅ [2FA SERVICE] User updated successfully with 2FA data');
      } catch (dbError) {
        console.error('💥 [2FA SERVICE] Database error saving user:', dbError);
        throw dbError;
      }

      console.log('🔧 [2FA SERVICE] Logging 2FA action...');
      // Log the setup initiation
      await this.logTwoFactorAction(userId, LogAction.UPDATE, 'Two-factor authentication setup initiated');
      console.log('✅ [2FA SERVICE] 2FA action logged successfully');

      console.log('✅ [2FA SERVICE] generateSetup completed successfully');
      return {
        success: true,
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        message: 'Two-factor authentication setup generated successfully',
      };
    } catch (error) {
      console.error('💥 [2FA SERVICE] Error in generateSetup:', error);
      logger.error('Error generating 2FA setup:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Verify and enable 2FA
   */
  static async enableTwoFactor(userId: number, token: string): Promise<TwoFactorVerificationResult> {
    try {
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user || !user.twoFactorSecret) {
        return {
          success: false,
          message: 'Two-factor authentication not set up',
        };
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps before/after current time
      });

      if (!verified) {
        return {
          success: false,
          message: 'Invalid verification code',
        };
      }

      // Enable 2FA
      user.twoFactorEnabled = true;
      await userRepository.save(user);

      // Log the enablement
      await this.logTwoFactorAction(userId, LogAction.UPDATE, 'Two-factor authentication enabled');

      return {
        success: true,
        message: 'Two-factor authentication enabled successfully',
      };
    } catch (error) {
      logger.error('Error enabling 2FA:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Verify 2FA token during login
   */
  static async verifyTwoFactor(userId: number, token: string): Promise<TwoFactorVerificationResult> {
    try {
      console.log(`🔧 [2FA SERVICE] verifyTwoFactor called for userId: ${userId}, token: ${token}`);
      
      const userRepository = this.getUserRepository();
      console.log('🔧 [2FA SERVICE] Got user repository');
      
      const user = await userRepository.findOne({ where: { id: userId } });
      console.log('🔧 [2FA SERVICE] User query result:', user ? 
        `Found user - enabled: ${user.twoFactorEnabled}, hasSecret: ${!!user.twoFactorSecret}` : 
        'User not found');

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        console.log('❌ [2FA SERVICE] 2FA not enabled or secret missing');
        return {
          success: false,
          message: 'Two-factor authentication not enabled',
        };
      }

      console.log('🔧 [2FA SERVICE] Attempting TOTP verification...');
      console.log('🔧 [2FA SERVICE] Secret (first 10 chars):', user.twoFactorSecret.substring(0, 10) + '...');
      console.log('🔧 [2FA SERVICE] Token received:', token);
      console.log('🔧 [2FA SERVICE] Current server time:', new Date().toISOString());
      
      // First try TOTP verification with larger window for debugging
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 6, // Increased window for debugging (allows ±3 time steps)
      });
      console.log(`🔧 [2FA SERVICE] TOTP verification result: ${verified}`);

      // Also try generating current token for comparison
      const currentToken = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: 'base32'
      });
      console.log(`🔧 [2FA SERVICE] Current server-generated token: ${currentToken}`);
      console.log(`🔧 [2FA SERVICE] Token match: ${token === currentToken}`);

      if (verified) {
        console.log('✅ [2FA SERVICE] TOTP verification successful');
        await this.logTwoFactorAction(userId, LogAction.READ, 'Two-factor authentication verified with TOTP');
        return {
          success: true,
          message: 'Two-factor authentication verified',
        };
      }

      console.log('🔧 [2FA SERVICE] TOTP failed, trying backup codes...');
      // If TOTP fails, try backup codes
      const backupCodeResult = await this.verifyBackupCode(userId, token);
      console.log('🔧 [2FA SERVICE] Backup code verification result:', backupCodeResult);
      
      if (backupCodeResult.success) {
        console.log('✅ [2FA SERVICE] Backup code verification successful');
        return {
          success: true,
          message: 'Two-factor authentication verified with backup code',
          backupCodeUsed: true,
        };
      }

      console.log('❌ [2FA SERVICE] Both TOTP and backup code verification failed');
      await this.logTwoFactorAction(userId, LogAction.READ, 'Two-factor authentication verification failed');
      return {
        success: false,
        message: 'Invalid verification code',
      };
    } catch (error) {
      console.error('💥 [2FA SERVICE] Error in verifyTwoFactor:', error);
      logger.error('Error verifying 2FA:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Disable 2FA
   */
  static async disableTwoFactor(userId: number, currentPassword: string): Promise<TwoFactorVerificationResult> {
    try {
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid current password',
        };
      }

      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.twoFactorBackupCodes = null;
      await userRepository.save(user);

      // Log the disablement
      await this.logTwoFactorAction(userId, LogAction.UPDATE, 'Two-factor authentication disabled');

      return {
        success: true,
        message: 'Two-factor authentication disabled successfully',
      };
    } catch (error) {
      logger.error('Error disabling 2FA:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Get user's 2FA status
   */
  static async getTwoFactorStatus(userId: number): Promise<{ enabled: boolean; hasSecret: boolean }> {
    try {
      console.log(`🔧 [2FA SERVICE] getTwoFactorStatus called for userId: ${userId}`);
      
      const userRepository = this.getUserRepository();
      console.log('🔧 [2FA SERVICE] Got user repository');
      
      const user = await userRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'twoFactorEnabled', 'twoFactorSecret']
      });
      console.log('🔧 [2FA SERVICE] User query result:', user ? 
        `Found user - enabled: ${user.twoFactorEnabled}, hasSecret: ${!!user.twoFactorSecret}` : 
        'User not found');

      if (!user) {
        console.log('❌ [2FA SERVICE] User not found in getTwoFactorStatus');
        return { enabled: false, hasSecret: false };
      }

      const result = {
        enabled: user.twoFactorEnabled || false,
        hasSecret: !!user.twoFactorSecret
      };
      
      console.log('✅ [2FA SERVICE] getTwoFactorStatus result:', result);
      return result;
    } catch (error) {
      console.error('💥 [2FA SERVICE] Error in getTwoFactorStatus:', error);
      logger.error('Error getting 2FA status:', error);
      return { enabled: false, hasSecret: false };
    }
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId: number): Promise<{ success: boolean; backupCodes?: string[]; message?: string }> {
    try {
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user || !user.twoFactorEnabled) {
        return {
          success: false,
          message: 'Two-factor authentication not enabled',
        };
      }

      const backupCodes = this.generateBackupCodes();
      user.twoFactorBackupCodes = JSON.stringify(backupCodes);
      await userRepository.save(user);

      await this.logTwoFactorAction(userId, LogAction.UPDATE, 'Two-factor backup codes regenerated');

      return {
        success: true,
        backupCodes,
        message: 'Backup codes regenerated successfully',
      };
    } catch (error) {
      logger.error('Error regenerating backup codes:', error);
      return {
        success: false,
        message: 'Internal server error',
      };
    }
  }

  /**
   * Verify backup code and mark as used
   */
  private static async verifyBackupCode(userId: number, code: string): Promise<TwoFactorVerificationResult> {
    try {
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user || !user.twoFactorBackupCodes) {
        return { success: false, message: 'No backup codes available' };
      }

      const backupCodes: string[] = JSON.parse(user.twoFactorBackupCodes);
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex === -1) {
        return { success: false, message: 'Invalid backup code' };
      }

      // Remove the used backup code
      backupCodes.splice(codeIndex, 1);
      user.twoFactorBackupCodes = JSON.stringify(backupCodes);
      await userRepository.save(user);

      await this.logTwoFactorAction(userId, LogAction.UPDATE, 'Backup code used for two-factor authentication');

      return { success: true, message: 'Backup code verified' };
    } catch (error) {
      logger.error('Error verifying backup code:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Log 2FA actions
   */
  private static async logTwoFactorAction(userId: number, action: LogAction, details: string): Promise<void> {
    try {
      const logRepository = this.getLogRepository();
      const log = new Log();
      log.userId = userId;
      log.action = action;
      log.entityType = EntityType.USER;
      log.entityId = userId;
      log.details = details;
      log.timestamp = new Date();

      await logRepository.save(log);
    } catch (error) {
      logger.error('Error logging 2FA action:', error);
    }
  }
} 