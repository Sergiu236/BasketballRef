// src/validators/refereeValidator.ts

import { Referee } from '../models/Referee';

// Helper to parse/validate date in MM/DD/YYYY format, ensuring it's in the future
function parseAndValidateFutureDate(dateStr: string): boolean {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }
  const [monthStr, dayStr, yearStr] = dateStr.split('/');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const year = parseInt(yearStr, 10);

  // Basic range checks
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000) {
    return false;
  }

  const parsedDate = new Date(year, month - 1, day);

  // Check if the parsed date components match exactly
  if (
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day ||
    parsedDate.getFullYear() !== year
  ) {
    return false;
  }

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compare dates
  return parsedDate >= today;
}

export function validateReferee(ref: Referee): string {
  // Check required fields
  if (
    !ref.firstName ||
    !ref.lastName ||
    !ref.league ||
    ref.age === undefined ||
    ref.grade === undefined ||
    !ref.promovationDate ||
    ref.refereedGames === undefined ||
    !ref.t1VsT2 ||
    !ref.matchDate
  ) {
    return 'All fields are required.';
  }

  // Check name regex
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(ref.firstName) || !nameRegex.test(ref.lastName)) {
    return 'First name and last name must contain only letters and spaces.';
  }

  // Check numeric fields: must be numbers and non-negative
  if (
    isNaN(ref.age) || ref.age < 0 ||
    isNaN(ref.grade) || ref.grade < 0 ||
    isNaN(ref.refereedGames) || ref.refereedGames < 0
  ) {
    return 'Age, Grade, and Refereed Games must be non-negative numbers.';
  }

  // Check T1 vs T2 format
  const vsRegex = /^[A-Za-z0-9\s]+\s+vs\s+[A-Za-z0-9\s]+$/i;
  if (!vsRegex.test(ref.t1VsT2)) {
    return 'T1 vs T2 must be in the format "Team1 vs Team2".';
  }

  // Check future dates
  if (!parseAndValidateFutureDate(ref.promovationDate)) {
    return 'Promovation date must be a valid future date (MM/DD/YYYY).';
  }
  if (!parseAndValidateFutureDate(ref.matchDate)) {
    return 'Match date must be a valid future date (MM/DD/YYYY).';
  }

  return '';
}
