import { Request, Response } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { LoggingService } from '../services/loggingService';
import { AuthenticatedRequest } from '../middleware/auth';
import { LogAction, EntityType } from '../entities/Log';
import { logger } from '../utils/logger';

/**
 * Get all monitored users (admin only)
 */
export const getMonitoredUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    
    const monitoredUsers = await MonitoringService.getMonitoredUsers(activeOnly);
    
    // Log this action
    if (req.user) {
      await LoggingService.logAction(
        req.user.id,
        LogAction.READ,
        EntityType.MONITORED_USER,
        null,
        'Retrieved list of monitored users'
      );
    }
    
    return res.status(200).json(monitoredUsers);
  } catch (error) {
    logger.error('Error fetching monitored users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Resolve a monitored user (admin only)
 */
export const resolveMonitoredUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const updatedMonitoredUser = await MonitoringService.resolveMonitoredUser(
      parseInt(id),
      req.user.id
    );
    
    // Log this action
    await LoggingService.logAction(
      req.user.id,
      LogAction.UPDATE,
      EntityType.MONITORED_USER,
      parseInt(id),
      `Resolved monitored user ID ${id}`
    );
    
    return res.status(200).json({
      message: 'Monitored user resolved successfully',
      monitoredUser: updatedMonitoredUser,
    });
  } catch (error) {
    logger.error('Error resolving monitored user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get system logs with pagination (admin only)
 */
export const getLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const { logs, total } = await LoggingService.getAllLogs(limit, offset);
    
    // Log this action
    if (req.user) {
      await LoggingService.logAction(
        req.user.id,
        LogAction.READ,
        EntityType.USER,
        null,
        'Retrieved system logs'
      );
    }
    
    return res.status(200).json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get logs for a specific user
 */
export const getUserLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const { logs, total } = await LoggingService.getUserLogs(
      parseInt(userId),
      limit,
      offset
    );
    
    // Log this action
    if (req.user) {
      await LoggingService.logAction(
        req.user.id,
        LogAction.READ,
        EntityType.USER,
        parseInt(userId),
        `Retrieved logs for user ID ${userId}`
      );
    }
    
    return res.status(200).json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    logger.error(`Error fetching logs for user ${req.params.userId}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 