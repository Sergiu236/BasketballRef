import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Register a new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

export default router; 