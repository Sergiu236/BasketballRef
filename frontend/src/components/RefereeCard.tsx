// src/components/RefereeCard.tsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaTrash,
  FaCrown,
  FaExclamation,
  FaMedal
} from 'react-icons/fa'; // removed FaCertificate, we now reuse FaMedal for bronze
import { Referee } from '../data/referees';
import { RefereeContext } from '../context/RefereeContext';
import './RefereeCard.css';

interface Props {
  referee: Referee;
  badgeTier: 'best' | 'worst' | 'silver' | 'bronze';
}

const RefereeCard: React.FC<Props> = ({ referee, badgeTier }) => {
  const navigate = useNavigate();
  const { deleteReferee } = useContext(RefereeContext);

  const handleCardClick = () => {
    navigate(`/referee/${referee.id}`);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/update/${referee.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this referee?')) {
      deleteReferee(referee.id);
    }
  };

  let badgeClass = '';
  let BadgeIcon: React.ReactNode = null;

  switch (badgeTier) {
    case 'best':
      badgeClass = 'badge-best';
      BadgeIcon = <FaCrown />;
      break;
    case 'worst':
      badgeClass = 'badge-worst';
      BadgeIcon = <FaExclamation />;
      break;
    case 'silver':
      badgeClass = 'badge-silver';
      BadgeIcon = <FaMedal />;
      break;
    case 'bronze':
      badgeClass = 'badge-bronze';
      BadgeIcon = <FaMedal />;
      break;
  }

  return (
    <div className="referee-card" onClick={handleCardClick}>
      <div className={`badge ${badgeClass}`}>
        {BadgeIcon}
      </div>

      <img
        src={referee.photo}
        alt={`${referee.firstName} ${referee.lastName}`}
        className="referee-photo"
      />
      <h3 className="referee-name">
        {referee.firstName} {referee.lastName}
      </h3>
      <p className="referee-league">{referee.league}</p>
      <p className="referee-age">{referee.age} years</p>
      <p className="referee-grade">Grade: {referee.grade}</p>

      <div className="card-buttons">
        <button onClick={handleEditClick} className="edit-button" title="Edit">
          <FaEdit />
        </button>
        <button onClick={handleDeleteClick} className="delete-button" title="Delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default RefereeCard;
