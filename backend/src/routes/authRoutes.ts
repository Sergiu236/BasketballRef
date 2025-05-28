import express from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/complete-2fa-login', authController.completeTwoFactorLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/sessions', authenticateToken, authController.getSessions);
router.post('/logout-all', authenticateToken, authController.logoutAllDevices);
router.delete('/sessions/:sessionId', authenticateToken, authController.revokeSession);

export default router; 