import { dataSource } from '../index';
import { Log, LogAction, EntityType } from '../entities/Log';
import { logger } from '../utils/logger';
import { User } from '../entities/User';
import { Between } from 'typeorm';

/**
 * Service for logging user actions in the system
 */
export class LoggingService {
  /**
   * Log a user action
   * @param userId The ID of the user performing the action
   * @param action The action being performed (create, read, update, delete)
   * @param entityType The type of entity being acted upon
   * @param entityId The ID of the entity (if applicable)
   * @param details Additional details about the action
   */
  static async logAction(
    userId: number,
    action: LogAction,
    entityType: EntityType,
    entityId: number | null = null,
    details: string | null = null
  ): Promise<Log> {
    try {
      const logRepository = dataSource.getRepository(Log);
      
      const log = new Log();
      log.userId = userId;
      log.action = action;
      log.entityType = entityType;
      log.entityId = entityId;
      log.details = details;
      
      const savedLog = await logRepository.save(log);
      logger.info(`Logged action: ${action} on ${entityType} by user ${userId}`);
      
      return savedLog;
    } catch (error) {
      logger.error('Error logging action:', error);
      throw error;
    }
  }

  /**
   * Get logs for a specific user
   * @param userId The ID of the user
   * @param limit Maximum number of logs to return
   * @param offset Offset for pagination
   */
  static async getUserLogs(
    userId: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: Log[]; total: number }> {
    try {
      const logRepository = dataSource.getRepository(Log);
      
      const [logs, total] = await logRepository.findAndCount({
        where: { userId },
        order: { timestamp: 'DESC' },
        take: limit,
        skip: offset,
      });
      
      return { logs, total };
    } catch (error) {
      logger.error('Error fetching user logs:', error);
      throw error;
    }
  }

  /**
   * Get all logs with pagination
   * @param limit Maximum number of logs to return
   * @param offset Offset for pagination
   */
  static async getAllLogs(
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: Log[]; total: number }> {
    try {
      const logRepository = dataSource.getRepository(Log);
      
      const [logs, total] = await logRepository.findAndCount({
        relations: ['user'],
        order: { timestamp: 'DESC' },
        take: limit,
        skip: offset,
      });
      
      return { logs, total };
    } catch (error) {
      logger.error('Error fetching all logs:', error);
      throw error;
    }
  }

  /**
   * Get logs for a specific time period
   * @param startTime Start time for the period
   * @param endTime End time for the period
   */
  static async getLogsByTimeRange(
    startTime: Date,
    endTime: Date
  ): Promise<Log[]> {
    try {
      const logRepository = dataSource.getRepository(Log);
      
      const logs = await logRepository.find({
        where: {
          timestamp: Between(startTime, endTime),
        },
        relations: ['user'],
        order: { timestamp: 'ASC' },
      });
      
      return logs;
    } catch (error) {
      logger.error('Error fetching logs by time range:', error);
      throw error;
    }
  }
} 