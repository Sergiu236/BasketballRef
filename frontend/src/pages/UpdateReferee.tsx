import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefereeContext } from '../context/RefereeContext';
import { Referee } from '../data/referees';
import './UpdateReferee.css';

const UpdateReferee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { referees, updateReferee } = useContext(RefereeContext);
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [referee, setReferee] = useState<Referee | null>(null);

  // Form state – will be pre-populated once we fetch the referee
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [league, setLeague] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [promovationDate, setPromovationDate] = useState('');
  const [refereedGames, setRefereedGames] = useState('');
  const [t1VsT2, setT1VsT2] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [photo, setPhoto] = useState('');

  // Popup state for success message
  const [showPopup, setShowPopup] = useState(false);

  // On component mount, find the referee using the id from the URL
  useEffect(() => {
    if (id && referees.length > 0) {
      const found = referees.find((r) => r.id === parseInt(id));
      if (found) {
        setReferee(found);
        // Pre-populate form fields
        setFirstName(found.firstName);
        setLastName(found.lastName);
        setLeague(found.league);
        setAge(String(found.age));
        setGrade(String(found.grade));
        setPromovationDate(found.promovationDate);
        setRefereedGames(String(found.refereedGames));
        setT1VsT2(found.t1VsT2);
        setMatchDate(found.matchDate);
        setPhoto(found.photo);
      } else {
        setError('Referee not found.');
      }
    }
  }, [id, referees]);

  // File input handler for photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  // Update form submission handler
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validations
    if (!firstName.trim() || !lastName.trim() || !league.trim()) {
      setError('First name, last name, and league are required.');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge)) {
      setError('Age must be a number.');
      return;
    }
    const parsedGrade = parseInt(grade, 10);
    if (isNaN(parsedGrade)) {
      setError('Grade must be a number.');
      return;
    }
    const parsedGames = parseInt(refereedGames, 10);
    if (isNaN(parsedGames)) {
      setError('Refereed games must be a number.');
      return;
    }

    if (referee) {
      const updatedReferee: Referee = {
        id: referee.id,
        firstName,
        lastName,
        league,
        age: parsedAge,
        grade: parsedGrade,
        promovationDate,
        refereedGames: parsedGames,
        t1VsT2,
        matchDate,
        photo: photo || '/default.jpg',
      };
      updateReferee(updatedReferee);
      setShowPopup(true);
    }
  };

  const handlePopupOk = () => {
    setShowPopup(false);
    navigate('/');
  };

  return (
    <div className="update-referee-container">
      <h2>Update Referee</h2>
      {error && <p className="error-message">{error}</p>}
      {referee ? (
        <form onSubmit={handleUpdateSubmit} className="update-form">
          <div className="form-field">
            <label>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>League:</label>
            <input
              type="text"
              value={league}
              onChange={(e) => setLeague(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Age:</label>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Grade:</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Promovation Date:</label>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              value={promovationDate}
              onChange={(e) => setPromovationDate(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Refereed Games:</label>
            <input
              type="text"
              value={refereedGames}
              onChange={(e) => setRefereedGames(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>T1 vs T2:</label>
            <input
              type="text"
              value={t1VsT2}
              onChange={(e) => setT1VsT2(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Match Date:</label>
            <input
              type="text"
              placeholder="MM/DD/YYYY"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {photo && <img src={photo} alt="Preview" className="photo-preview" />}
          </div>
          <button type="submit" className="submit-button">
            Update Referee
          </button>
        </form>
      ) : (
        <p>Loading referee data...</p>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-message">
            <p>Referee updated successfully!</p>
            <button onClick={handlePopupOk}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateReferee;
