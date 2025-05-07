import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefereeContext } from '../context/RefereeContext';
import { Referee } from '../data/referees';
import './AddReferee.css';

const AddReferee: React.FC = () => {
  const { referees, addReferee } = useContext(RefereeContext);
  const navigate = useNavigate();

  // Form fields
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

  // Error state
  const [error, setError] = useState('');

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // for names: letters (upper and lower) and spaces only
  const nameRegex = /^[A-Za-z\s]+$/;

  // "Team1 vs Team2" type format
  // This enforces at least one character, " vs ", and at least one character after.
  
  const vsRegex = /^[A-Za-z0-9\s]+\s+vs\s+[A-Za-z0-9\s]+$/i;

  // for date in MM/DD/YYYY format
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  // Helper to validate and parse a date string in MM/DD/YYYY format
  // Returns a Date object if valid, or null if invalid.
  const parseAndValidateFutureDate = (dateStr: string): Date | null => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateStr)) {
      return null;
    }
    const [monthStr, dayStr, yearStr] = dateStr.split('/');
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);

    // Basic range checks
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000) {
      return null;
    }

    const parsedDate = new Date(year, month - 1, day);
    
    // Check if the parsed date components match exactly
    if (
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day ||
      parsedDate.getFullYear() !== year
    ) {
      return null;
    }

    return parsedDate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check that all fields are non-empty
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !league.trim() ||
      !age.trim() ||
      !grade.trim() ||
      !promovationDate.trim() ||
      !refereedGames.trim() ||
      !t1VsT2.trim() ||
      !matchDate.trim()
    ) {
      setError('Please fill in all fields.');
      return;
    }

    // Validate first and last name
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      setError('First name and last name must contain only letters and spaces.');
      return;
    }

    // Validate numeric fields (age, grade, refereed games)
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge)) {
      setError('Age must be a valid number.');
      return;
    }
    const parsedGrade = parseInt(grade, 10);
    if (isNaN(parsedGrade)) {
      setError('Grade must be a valid number.');
      return;
    }
    const parsedGames = parseInt(refereedGames, 10);
    if (isNaN(parsedGames)) {
      setError('Refereed games must be a valid number.');
      return;
    }

    // Validate T1 vs T2 format
    if (!vsRegex.test(t1VsT2)) {
      setError('T1 vs T2 must be in the format "Team1 vs Team2".');
      return;
    }

    // Validate dates
    const validPromovationDate = parseAndValidateFutureDate(promovationDate);
    if (!validPromovationDate) {
      setError('Promovation date must be a valid future date (MM/DD/YYYY).');
      return;
    }
    const validMatchDate = parseAndValidateFutureDate(matchDate);
    if (!validMatchDate) {
      setError('Match date must be a valid future date (MM/DD/YYYY).');
      return;
    }

    // Compute new id as max existing id + 1
    const newId = referees.length > 0 ? Math.max(...referees.map(r => r.id)) + 1 : 1;

    const newReferee: Referee = {
      id: newId,
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

    addReferee(newReferee);
    setShowPopup(true);
  };

  const handlePopupOk = () => {
    setShowPopup(false);
    navigate('/');
  };

  return (
    <div className="add-referee-container">
      <h2>Add Referee</h2>
      <form onSubmit={handleSubmit} className="add-referee-form">
        {error && <p className="error-message">{error}</p>}

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
          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
          >
            <option value="">Select a league</option>
            <option value="NBA">NBA</option>
            <option value="LNBM">LNBM</option>
            <option value="LNBF">LNBF</option>
            <option value="Liga ACB">Liga ACB</option>
            <option value="FIBA">FIBA</option>
          </select>
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
          <label>Promovation Date (MM/DD/YYYY):</label>
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
            placeholder="e.g., Lakers vs Warriors"
            value={t1VsT2} 
            onChange={(e) => setT1VsT2(e.target.value)} 
          />
        </div>

        <div className="form-field">
          <label>Match Date (MM/DD/YYYY):</label>
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

        <button type="submit" className="submit-button">Add Referee</button>
      </form>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-message">
            <p>Referee added successfully!</p>
            <button onClick={handlePopupOk}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReferee;
