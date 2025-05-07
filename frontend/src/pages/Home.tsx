import React, { useState, useContext, useEffect } from 'react';
import RefereeCard from '../components/RefereeCard';
import { RefereeContext } from '../context/RefereeContext';
import { filterReferees } from '../utils/filterReferees';
import { getTierMap } from '../utils/tierLogic';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import StatusIndicator from '../components/StatusIndicator';

// ── ADD THESE IMPORTS ──
import { startGeneration, stopGeneration, onGenerationStatus } from '../websocket/websocketClient';

import './Home.css';

const Home: React.FC = () => {
  const {
    referees,
    loadMoreReferees,
    isLoading,
    hasMore,
  } = useContext(RefereeContext);

  const [leagueFilter, setLeagueFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Replace local generation state/logic with a simple "isGenerating" that
  //    reflects server-side generation status via WebSocket.
  // ─────────────────────────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Subscribe to "generationStatus" events from the backend
  //    so our state is always synced with the server’s actual generation state.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleStatus = (status: boolean) => {
      setIsGenerating(status);
    };
    onGenerationStatus(handleStatus);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) Clicking the button either starts or stops generation on the server side
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGenerateClick = () => {
    if (!isGenerating) {
      startGeneration();
    } else {
      stopGeneration();
    }
  };

  // Filter and tier logic remain the same
  const filteredReferees = filterReferees(referees, leagueFilter, sortOrder, searchTerm);
  const tierMap = getTierMap(filteredReferees);

  // Use infinite scroll to load more
  const lastElementRef = useInfiniteScroll({
    loadMore: loadMoreReferees,
    hasMore,
    isLoading,
  });

  return (
    <div className="home-container">
      <StatusIndicator />

      <div className="top-controls">
        <button className="generate-button" onClick={handleGenerateClick}>
          {isGenerating ? 'Stop' : 'Generate'}
        </button>

        <select
          value={leagueFilter}
          onChange={(e) => setLeagueFilter(e.target.value)}
          className="control-select"
        >
          <option value="">All Leagues</option>
          <option value="NBA">NBA</option>
          <option value="LNBM">LNBM</option>
          <option value="LNBF">LNBF</option>
          <option value="Liga ACB">Liga ACB</option>
          <option value="FIBA">FIBA</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="control-select"
        >
          <option value="asc">Name Asc</option>
          <option value="desc">Name Desc</option>
        </select>

        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="control-input"
        />
      </div>

      {filteredReferees.length === 0 && !isLoading ? (
        <p>No referees found.</p>
      ) : (
        <div className="cards-container">
          {filteredReferees.map((ref, idx) => {
            const tier = tierMap[ref.id] || 'bronze';
            const isLast = idx === filteredReferees.length - 1;
            return (
              <div key={ref.id} ref={isLast ? lastElementRef : null}>
                <RefereeCard referee={ref} badgeTier={tier} />
              </div>
            );
          })}
        </div>
      )}

      {isLoading && <p>Loading more…</p>}
    </div>
  );
};

export default Home;
