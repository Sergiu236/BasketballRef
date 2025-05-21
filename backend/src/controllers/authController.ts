import { Request, Response } from 'express';
import { dataSource } from '../index';
import { User, UserRole } from '../entities/User';
import { Log, LogAction, EntityType } from '../entities/Log';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const userRepository = dataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
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
    const logRepository = dataSource.getRepository(Log);
    const log = new Log();
    log.userId = savedUser.id;
    log.action = LogAction.REGISTER;
    log.entityType = EntityType.USER;
    log.entityId = savedUser.id;
    log.details = `User ${username} registered`;
    await logRepository.save(log);

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser.id, username: savedUser.username, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password and with token
    const { password: _, ...userWithoutPassword } = savedUser;
    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    // Find user
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await userRepository.save(user);

    // Log the login
    const logRepository = dataSource.getRepository(Log);
    const log = new Log();
    log.userId = user.id;
    log.action = LogAction.LOGIN;
    log.entityType = EntityType.USER;
    log.entityId = user.id;
    log.details = `User ${username} logged in`;
    await logRepository.save(log);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password and with token
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    logger.error('Error logging in:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 