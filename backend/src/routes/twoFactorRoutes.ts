import express from 'express';
import * as twoFactorController from '../controllers/twoFactorController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.get('/status', authenticateToken, twoFactorController.getTwoFactorStatus);
router.post('/setup', authenticateToken, twoFactorController.generateSetup);
router.post('/enable', authenticateToken, twoFactorController.enableTwoFactor);
router.post('/disable', authenticateToken, twoFactorController.disableTwoFactor);
router.post('/backup-codes/regenerate', authenticateToken, twoFactorController.regenerateBackupCodes);

// Public route for login verification
router.post('/verify', twoFactorController.verifyTwoFactor);

export default router; 