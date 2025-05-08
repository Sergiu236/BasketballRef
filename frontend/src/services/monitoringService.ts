import config from '../config';
import { authHeader } from './authService';

export interface MonitoredUser {
  id: number;
  userId: number;
  reason: string;
  detectedAt: string;
  actionsCount: number;
  timeWindow: number;
  isActive: boolean;
  resolvedAt: string | null;
  resolvedBy: number | null;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  resolvedByUser?: {
    id: number;
    username: string;
  };
}

export interface Log {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  timestamp: string;
  details: string | null;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface LogsResponse {
  logs: Log[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get all monitored users (admin only)
 */
export const getMonitoredUsers = async (activeOnly: boolean = true): Promise<MonitoredUser[]> => {
  try {
    const response = await fetch(
      `${config.API_URL}/api/monitoring/monitored-users?activeOnly=${activeOnly}`,
      {
        headers: {
          ...authHeader(),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch monitored users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching monitored users:', error);
    throw error;
  }
};

/**
 * Resolve a monitored user (admin only)
 */
export const resolveMonitoredUser = async (id: number): Promise<MonitoredUser> => {
  try {
    const response = await fetch(
      `${config.API_URL}/api/monitoring/monitored-users/${id}/resolve`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to resolve monitored user');
    }

    const data = await response.json();
    return data.monitoredUser;
  } catch (error) {
    console.error('Error resolving monitored user:', error);
    throw error;
  }
};

/**
 * Get all system logs (admin only)
 */
export const getLogs = async (
  limit: number = 100,
  offset: number = 0
): Promise<LogsResponse> => {
  try {
    const response = await fetch(
      `${config.API_URL}/api/monitoring/logs?limit=${limit}&offset=${offset}`,
      {
        headers: {
          ...authHeader(),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch logs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

/**
 * Get logs for a specific user (admin only)
 */
export const getUserLogs = async (
  userId: number,
  limit: number = 100,
  offset: number = 0
): Promise<LogsResponse> => {
  try {
    const response = await fetch(
      `${config.API_URL}/api/monitoring/logs/user/${userId}?limit=${limit}&offset=${offset}`,
      {
        headers: {
          ...authHeader(),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user logs');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching logs for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Format a timestamp into a readable date/time
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
}; 