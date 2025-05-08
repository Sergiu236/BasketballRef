import { dataSource } from '../index';
import { Log, LogAction } from '../entities/Log';
import { MonitoredUser } from '../entities/MonitoredUser';
import { User } from '../entities/User';
import { logger } from '../utils/logger';
import { Between } from 'typeorm';

/**
 * Constants for monitoring thresholds
 */
const SUSPICIOUS_ACTIONS_THRESHOLD = 5; // Number of actions in time window to be considered suspicious
const TIME_WINDOW_MINUTES = 2; // Time window in minutes

/**
 * Service for monitoring suspicious user activity
 */
export class MonitoringService {
  private static isRunning = false;
  private static interval: NodeJS.Timeout | null = null;

  /**
   * Start the monitoring process
   * @param intervalMs How often to check for suspicious activity (in milliseconds)
   */
  static startMonitoring(intervalMs: number = 60000): void {
    if (this.isRunning) {
      logger.warn('Monitoring service is already running');
      return;
    }

    logger.info('Starting user activity monitoring service');
    
    this.isRunning = true;
    this.interval = setInterval(async () => {
      try {
        await this.checkForSuspiciousActivity();
      } catch (error) {
        logger.error('Error in monitoring service:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop the monitoring process
   */
  static stopMonitoring(): void {
    if (!this.isRunning || !this.interval) {
      logger.warn('Monitoring service is not running');
      return;
    }

    logger.info('Stopping user activity monitoring service');
    
    clearInterval(this.interval);
    this.isRunning = false;
    this.interval = null;
  }

  /**
   * Check for suspicious activity patterns
   */
  static async checkForSuspiciousActivity(): Promise<void> {
    if (!dataSource.isInitialized) {
      logger.error('Cannot check for suspicious activity: DataSource not initialized');
      return;
    }

    logger.info('Checking for suspicious user activity');
    
    try {
      const timeWindow = TIME_WINDOW_MINUTES * 60 * 1000; // convert to milliseconds
      const startTime = new Date(Date.now() - timeWindow);
      
      // Get logs within the time window
      const logRepository = dataSource.getRepository(Log);
      const recentLogs = await logRepository.find({
        where: {
          timestamp: Between(startTime, new Date())
        },
        relations: ['user']
      });
      
      logger.info(`Found ${recentLogs.length} logs in the last ${TIME_WINDOW_MINUTES} minutes`);
      
      // Group logs by user
      const userActivityCounts = new Map<number, number>();
      for (const log of recentLogs) {
        if (!log.userId) continue;
        
        const count = userActivityCounts.get(log.userId) || 0;
        userActivityCounts.set(log.userId, count + 1);
      }
      
      // Check if any user has suspicious activity
      for (const [userId, count] of userActivityCounts.entries()) {
        logger.info(`User ${userId} has ${count} actions in the last ${TIME_WINDOW_MINUTES} minutes`);
        
        if (count >= SUSPICIOUS_ACTIONS_THRESHOLD) {
          await this.flagSuspiciousUser(userId, count);
        }
      }
      
      logger.info('Completed suspicious activity check');
    } catch (error) {
      logger.error('Error checking for suspicious activity:', error);
    }
  }

  /**
   * Get all monitored users
   */
  static async getMonitoredUsers(activeOnly: boolean = true): Promise<MonitoredUser[]> {
    try {
      const monitoredUserRepository = dataSource.getRepository(MonitoredUser);
      
      const whereCondition = activeOnly ? { isActive: true } : {};
      
      return await monitoredUserRepository.find({
        where: whereCondition,
        relations: ['user', 'resolvedByUser'],
        order: { detectedAt: 'DESC' },
      });
    } catch (error) {
      logger.error('Error fetching monitored users:', error);
      throw error;
    }
  }

  /**
   * Resolve a monitored user (mark as no longer monitored)
   */
  static async resolveMonitoredUser(
    monitoredUserId: number,
    adminUserId: number
  ): Promise<MonitoredUser> {
    try {
      const monitoredUserRepository = dataSource.getRepository(MonitoredUser);
      
      const monitoredUser = await monitoredUserRepository.findOne({
        where: { id: monitoredUserId },
      });
      
      if (!monitoredUser) {
        throw new Error(`Monitored user with ID ${monitoredUserId} not found`);
      }
      
      monitoredUser.isActive = false;
      monitoredUser.resolvedAt = new Date();
      monitoredUser.resolvedBy = adminUserId;
      
      return await monitoredUserRepository.save(monitoredUser);
    } catch (error) {
      logger.error('Error resolving monitored user:', error);
      throw error;
    }
  }

  /**
   * Flag a user as suspicious
   */
  static async flagSuspiciousUser(userId: number, actionsCount: number): Promise<void> {
    try {
      const monitoredUserRepository = dataSource.getRepository(MonitoredUser);
      const userRepository = dataSource.getRepository(User);
      
      // Check if this user is already being monitored
      const existingMonitoring = await monitoredUserRepository.findOne({
        where: { 
          userId: userId,
          isActive: true
        },
      });

      if (!existingMonitoring) {
        // Get the user to log their username
        const user = await userRepository.findOne({ where: { id: userId } });
        
        // Add user to monitored users list
        const monitoredUser = new MonitoredUser();
        monitoredUser.userId = userId;
        monitoredUser.reason = `Performed ${actionsCount} actions in ${TIME_WINDOW_MINUTES} minutes`;
        monitoredUser.actionsCount = actionsCount;
        monitoredUser.timeWindow = TIME_WINDOW_MINUTES;
        monitoredUser.isActive = true;
        
        await monitoredUserRepository.save(monitoredUser);
        logger.warn(`Added user ${user?.username || userId} to monitored users list for ${actionsCount} actions in ${TIME_WINDOW_MINUTES} minutes`);
      } else {
        logger.info(`User ${userId} is already being monitored`);
      }
    } catch (error) {
      logger.error(`Error flagging user ${userId} as suspicious:`, error);
    }
  }
} 