import { dataSource } from '../index';
import { Log, LogAction } from '../entities/Log';
import { MonitoredUser } from '../entities/MonitoredUser';
import { User } from '../entities/User';
import { logger } from '../utils/logger';
import { Between, MoreThan, LessThan } from 'typeorm';

/**
 * Constants for monitoring thresholds
 */
const SUSPICIOUS_ACTIONS_THRESHOLD = 15; // Number of actions in time window to be considered suspicious
const TIME_WINDOW_SECONDS = 20; // Time window in seconds (much shorter to detect rapid actions)

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
  static startMonitoring(intervalMs: number = 10000): void { // Check every 10 seconds
    if (this.isRunning) {
      logger.warn('Monitoring service is already running');
      return;
    }

    logger.info('Starting user activity monitoring service');
    
    this.isRunning = true;
    
    // Run an immediate check
    this.checkForSuspiciousActivity().catch(error => {
      logger.error('Error in initial monitoring check:', error);
    });
    
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
      // Look back over a slightly longer period to find any 20-second windows with high activity
      const extendedLookback = 60 * 1000; // 60 seconds lookback to find any suspicious 20-second windows
      const timeWindow = TIME_WINDOW_SECONDS * 1000; // 20 seconds in milliseconds
      const startTime = new Date(Date.now() - extendedLookback);
      
      const logRepository = dataSource.getRepository(Log);
      const userRepository = dataSource.getRepository(User);
      
      // Get all admin users to exclude them
      const adminUsers = await userRepository.find({
        where: {
          role: 'Admin'
        },
        select: ['id']
      });
      
      const adminUserIds = adminUsers.map(admin => admin.id);
      logger.info(`Found ${adminUserIds.length} admin users to exclude from monitoring`);
      
      // Get all active users who have logs in the extended lookback period
      const activeUsers = await logRepository
        .createQueryBuilder('log')
        .select('log.userId')
        .where('log.timestamp >= :startTime', { startTime })
        .andWhere('log.userId NOT IN (:...adminUserIds)', { 
          adminUserIds: adminUserIds.length > 0 ? adminUserIds : [0] 
        })
        .groupBy('log.userId')
        .getRawMany();
      
      logger.info(`Found ${activeUsers.length} active non-admin users in the last ${extendedLookback/1000} seconds`);
      
      // For each active user, check if they have a 20-second window with 15+ logs
      for (const user of activeUsers) {
        const userId = user.log_userId || user.userId;
        
        if (!userId) {
          logger.error(`Missing userId in activity data: ${JSON.stringify(user)}`);
          continue;
        }
        
        // Get all logs for this user in the extended period, ordered by timestamp
        const userLogs = await logRepository
          .createQueryBuilder('log')
          .where('log.userId = :userId', { userId })
          .andWhere('log.timestamp >= :startTime', { startTime })
          .orderBy('log.timestamp', 'ASC')
          .getMany();
        
        // Skip if not enough logs to possibly meet threshold
        if (userLogs.length < SUSPICIOUS_ACTIONS_THRESHOLD) {
          continue;
        }
        
        // Check for any 20-second window with 15+ actions
        let maxActionsInWindow = 0;
        let windowStartTime: Date | null = null;
        let windowEndTime: Date | null = null;
        
        for (let i = 0; i < userLogs.length; i++) {
          const currentLog = userLogs[i];
          const windowEnd = currentLog.timestamp;
          const windowStart = new Date(windowEnd.getTime() - timeWindow);
          
          // Count logs in this 20-second window
          const logsInWindow = userLogs.filter(log => 
            log.timestamp >= windowStart && log.timestamp <= windowEnd
          );
          
          if (logsInWindow.length > maxActionsInWindow) {
            maxActionsInWindow = logsInWindow.length;
            windowStartTime = windowStart;
            windowEndTime = windowEnd;
          }
          
          // Early exit if we've found a window that meets threshold
          if (maxActionsInWindow >= SUSPICIOUS_ACTIONS_THRESHOLD) {
            break;
          }
        }
        
        // If user has 15+ actions in any 20-second window, flag them
        if (maxActionsInWindow >= SUSPICIOUS_ACTIONS_THRESHOLD) {
          logger.info(`User ${userId} has ${maxActionsInWindow} actions in a 20-second window from ${windowStartTime} to ${windowEndTime}`);
          
          // Get user details for the flag
          const userDetails = await userRepository.findOne({ where: { id: parseInt(userId) } });
          
          // Create a detailed reason with the time window information
          const reason = `Performed ${maxActionsInWindow} actions in a 20-second window`;
          
          await this.flagSuspiciousUser(parseInt(userId), maxActionsInWindow, userDetails?.username);
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
  static async getMonitoredUsers(activeOnly: boolean = false): Promise<MonitoredUser[]> {
    try {
      const monitoredUserRepository = dataSource.getRepository(MonitoredUser);
      
      // Modified to return all monitored users by default
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
  static async flagSuspiciousUser(userId: number, actionsCount: number, username?: string | null): Promise<void> {
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
        // Get the user to log their username if not provided
        let userName = username;
        if (!userName) {
          const user = await userRepository.findOne({ where: { id: userId } });
          userName = user?.username;
        }
        
        // Add user to monitored users list
        const monitoredUser = new MonitoredUser();
        monitoredUser.userId = userId;
        monitoredUser.reason = `Performed ${actionsCount} actions in ${TIME_WINDOW_SECONDS} seconds`;
        monitoredUser.actionsCount = actionsCount;
        monitoredUser.timeWindow = TIME_WINDOW_SECONDS / 60; // Convert to minutes for DB storage
        monitoredUser.isActive = true;
        
        await monitoredUserRepository.save(monitoredUser);
        logger.warn(`Added user ${userName || userId} to monitored users list for ${actionsCount} actions in ${TIME_WINDOW_SECONDS} seconds`);
      } else {
        logger.info(`User ${userId} is already being monitored`);
      }
    } catch (error) {
      logger.error(`Error flagging user ${userId} as suspicious:`, error);
    }
  }
} 