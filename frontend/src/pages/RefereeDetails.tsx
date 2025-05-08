import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { RefereeContext } from '../context/RefereeContext';
import RefereeGames from '../components/RefereeGames';
import './RefereeDetails.css';

const RefereeDetails: React.FC = () => {
  const { id } = useParams();
  const refereeId = Number(id);

  // Use the context to access the current referees
  const { referees } = useContext(RefereeContext);
  const referee = referees.find((r) => r.id === refereeId);

  if (!referee) {
    return <div className="referee-details-container">Referee not found.</div>;
  }

  return (
    <div className="referee-details-container">
      <div className="details-background" />
      <img src={referee.photo} alt="Referee" className="referee-photo" />

      <div className="ref-name-box">
        {referee.firstName} {referee.lastName}
      </div>

      <div className="fields-container">
        <div className="field">
          <label>First Name</label>
          <div className="input-wrapper">
            <input type="text" value={referee.firstName} readOnly />
            <span className="clear-icon">✕</span>
          </div>
        </div>

        <div className="field">
          <label>Last Name</label>
          <div className="input-wrapper">
            <input type="text" value={referee.lastName} readOnly />
            <span className="clear-icon">✕</span>
          </div>
        </div>

        <div className="field">
          <label>League</label>
          <div className="input-wrapper">
            <input type="text" value={referee.league} readOnly />
            <span className="clear-icon">✕</span>
          </div>
        </div>

        <div className="field">
          <label>Grade</label>
          <div className="input-wrapper">
            <input type="text" value={String(referee.grade)} readOnly />
            <span className="clear-icon">✕</span>
          </div>
        </div>

        <div className="field">
          <label>Promovation Date</label>
          <div className="input-wrapper">
            <input type="text" value={referee.promovationDate} readOnly />
            <span className="clear-icon">✕</span>
          </div>
        </div>

        <div className="field">
          <label>Refereed Games</label>
          <div className="input-wrapper">
            <input type="text" value={String(referee.refereedGames)} readOnly />
            <span className="clear-icon">✕</span>
          </div>
        </div>

        <div className="big-rectangle">
          <div className="match-info">
            <label>{referee.t1VsT2}</label>
            <input type="text" value={referee.matchDate} readOnly />
          </div>
        </div>
      </div>
      
      {/* Add the RefereeGames component to display games for this referee */}
      <RefereeGames refereeId={refereeId} />
    </div>
  );
};

export default RefereeDetails;
