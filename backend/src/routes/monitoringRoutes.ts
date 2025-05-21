import express from 'express';
import * as monitoringController from '../controllers/monitoringController';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(authorizeAdmin);

// Get monitored users
router.get('/monitored-users', monitoringController.getMonitoredUsers);

// Resolve a monitored user
router.put('/monitored-users/:id/resolve', monitoringController.resolveMonitoredUser);

// Get all system logs
router.get('/logs', monitoringController.getLogs);

// Get logs for a specific user
router.get('/logs/user/:userId', monitoringController.getUserLogs);

export default router; 