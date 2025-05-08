import config from '../config';

// Type definitions for games
export interface Game {
  id: number;
  date: string;
  location: string;
  status: string;
  referee: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

/**
 * Fetch games for a specific referee
 */
export const getGamesByRefereeId = async (refereeId: number): Promise<Game[]> => {
  try {
    const response = await fetch(`${config.API_URL}/api/games/referee/${refereeId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching games: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getGamesByRefereeId:', error);
    return [];
  }
};

/**
 * Format a date string into a more readable format
 */
export const formatGameDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get a CSS class based on game status
 */
export const getStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'status-completed';
    case 'cancelled':
      return 'status-cancelled';
    case 'in progress':
      return 'status-in-progress';
    case 'scheduled':
    default:
      return 'status-scheduled';
  }
}; 