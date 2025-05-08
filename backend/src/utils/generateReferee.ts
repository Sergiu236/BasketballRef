import { Referee } from '../models/Referee';

// Helper function to generate a unique ID
function generateUniqueId(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

// Helper function to format date as MM/DD/YYYY
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// More diverse name options
const possibleFirstNames = [
  'Alex', 'Chris', 'Jordan', 'Taylor', 'Sam', 'Jamie', 'Riley', 'Dana',
  'Morgan', 'Casey', 'Quinn', 'Avery', 'Blake', 'Cameron', 'Drew', 'Emerson',
  'Finley', 'Gray', 'Harper', 'Indigo', 'Jules', 'Kai', 'London', 'Milan'
];

const possibleLastNames = [
  'Johnson', 'Lee', 'Morgan', 'Clark', 'Adams', 'Rodriguez', 'Green', 'Brown',
  'Smith', 'Williams', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson'
];

// Possible leagues and their associated teams
const leagueTeams = {
  'NBA': ['Lakers', 'Warriors', 'Celtics', 'Bulls', 'Heat', 'Nuggets', 'Knicks', 'Bucks'],
  'Liga ACB': ['Real Madrid', 'Barcelona', 'Valencia', 'Baskonia', 'Unicaja', 'Gran Canaria'],
  'FIBA': ['USA', 'Spain', 'France', 'Serbia', 'Argentina', 'Australia'],
  'LNBM': ['Steaua', 'Dinamo', 'Timisoara', 'Oradea', 'Cluj', 'Pitesti'],
  'LNBF': ['Craiova Women', 'Cluj Women', 'Pitesti Women', 'Brasov Women']
};

/**
 * generateRandomReferee
 * Creates a brand-new referee with random but realistic data
 */
export function generateRandomReferee(pool: Referee[]): Omit<Referee, 'id'> {
  // Generate random fields - remove id generation
  const firstName = possibleFirstNames[Math.floor(Math.random() * possibleFirstNames.length)];
  const lastName = possibleLastNames[Math.floor(Math.random() * possibleLastNames.length)];
  
  // Random league and teams
  const leagues = Object.keys(leagueTeams);
  const league = leagues[Math.floor(Math.random() * leagues.length)];
  const teams = leagueTeams[league as keyof typeof leagueTeams];
  const team1 = teams[Math.floor(Math.random() * teams.length)];
  const team2 = teams[Math.floor(Math.random() * teams.length)];
  const t1VsT2 = `${team1} vs ${team2}`;

  // Random stats
  const grade = randomInt(3, 10);
  const age = randomInt(20, 50);
  const refereedGames = randomInt(30, 200);

  // Generate dates - Use actual Date objects
  const now = new Date();
  const promovationDate = randomFutureDate(now, 2); // Within next 2 years
  const matchDate = randomFutureDate(now, 2); // Within next 2 years

  // Random photo (using a placeholder service)
  const photo = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;

  return {
    firstName,
    lastName,
    league,
    age,
    grade,
    promovationDate,
    refereedGames,
    t1VsT2,
    matchDate,
    photo,
  };
}

/** 
 * randomInt(min, max): returns an integer in [min..max]
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * randomPastDate(baseDate, yearsAgo): returns a Date object for a random day in the past
 */
function randomPastDate(baseDate: Date, yearsAgo: number): Date {
  const start = new Date(baseDate);
  start.setFullYear(start.getFullYear() - yearsAgo);
  const end = new Date(baseDate);
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const randomDays = Math.floor(Math.random() * daysDiff);
  const date = new Date(start);
  date.setDate(date.getDate() + randomDays);
  return date;
}

/**
 * randomFutureDate(baseDate, yearsAhead): returns a Date object for a random day in the future
 */
function randomFutureDate(baseDate: Date, yearsAhead: number): Date {
  const start = new Date(baseDate);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + yearsAhead);
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const randomDays = Math.floor(Math.random() * daysDiff);
  const date = new Date(start);
  date.setDate(date.getDate() + randomDays);
  return date;
} 