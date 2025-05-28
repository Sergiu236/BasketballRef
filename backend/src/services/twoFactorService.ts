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
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${appName} (${user.username})`,
        issuer: appName,
        length: 32,
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Store the secret temporarily (not enabled yet)
      user.twoFactorSecret = secret.base32;
      user.twoFactorBackupCodes = JSON.stringify(backupCodes);
      await userRepository.save(user);

      // Log the setup initiation
      await this.logTwoFactorAction(userId, LogAction.UPDATE, 'Two-factor authentication setup initiated');

      return {
        success: true,
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        message: 'Two-factor authentication setup generated successfully',
      };
    } catch (error) {
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
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return {
          success: false,
          message: 'Two-factor authentication not enabled',
        };
      }

      // First try TOTP verification
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (verified) {
        await this.logTwoFactorAction(userId, LogAction.READ, 'Two-factor authentication verified with TOTP');
        return {
          success: true,
          message: 'Two-factor authentication verified',
        };
      }

      // If TOTP fails, try backup codes
      const backupCodeResult = await this.verifyBackupCode(userId, token);
      if (backupCodeResult.success) {
        return {
          success: true,
          message: 'Two-factor authentication verified with backup code',
          backupCodeUsed: true,
        };
      }

      await this.logTwoFactorAction(userId, LogAction.READ, 'Two-factor authentication verification failed');
      return {
        success: false,
        message: 'Invalid verification code',
      };
    } catch (error) {
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
      const userRepository = this.getUserRepository();
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return { enabled: false, hasSecret: false };
      }

      return {
        enabled: user.twoFactorEnabled,
        hasSecret: !!user.twoFactorSecret,
      };
    } catch (error) {
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