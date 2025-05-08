import React, { useState, useEffect } from 'react';
import { getGamesByRefereeId, formatGameDate, getStatusClass, Game } from '../services/gamesService';
import './RefereeGames.css';

interface RefereeGamesProps {
  refereeId: number;
}

const RefereeGames: React.FC<RefereeGamesProps> = ({ refereeId }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const gamesData = await getGamesByRefereeId(refereeId);
        setGames(gamesData);
        setError(null);
      } catch (err) {
        setError('Failed to load games. Please try again later.');
        console.error('Error fetching referee games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [refereeId]);

  if (loading) {
    return <div className="games-loading">Loading games...</div>;
  }

  if (error) {
    return <div className="games-error">{error}</div>;
  }

  if (games.length === 0) {
    return <div className="games-empty">No games found for this referee.</div>;
  }

  return (
    <div className="referee-games-container">
      <h3 className="games-section-title">Referee's Games</h3>
      
      <div className="games-list">
        {games.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-header">
              <span className={`game-status ${getStatusClass(game.status)}`}>{game.status}</span>
              <span className="game-date">{formatGameDate(game.date)}</span>
            </div>
            
            <div className="game-details">
              <div className="game-location">
                <span className="location-icon">📍</span>
                <span>{game.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RefereeGames; 