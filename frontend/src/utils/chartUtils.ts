import { Referee } from '../data/referees';

/**
 * getLeagueBarData
 * Returns an array of {league, count} for the bar chart
 */
export function getLeagueBarData(referees: Referee[]) {
  const leagueCount: Record<string, number> = {};
  referees.forEach((ref) => {
    if (!leagueCount[ref.league]) {
      leagueCount[ref.league] = 0;
    }
    leagueCount[ref.league]++;
  });
  return Object.entries(leagueCount).map(([league, count]) => ({
    league,
    count,
  }));
}

/**
 * getTierPieData
 * Adapts your 4-tier logic (best, worst, silver, bronze)
 * into a pie-friendly array of {name, value}
 */
export function getTierPieData(referees: Referee[]) {
  if (referees.length === 0) {
    return [
      { name: 'Best', value: 0 },
      { name: 'Worst', value: 0 },
      { name: 'Silver', value: 0 },
      { name: 'Bronze', value: 0 },
    ];
  }

  const bestGrade = Math.max(...referees.map((r) => r.grade));
  const worstGrade = Math.min(...referees.map((r) => r.grade));

  const middle = referees.filter(
    (r) => r.grade !== bestGrade && r.grade !== worstGrade
  );
  middle.sort((a, b) => b.grade - a.grade);
  const half = Math.floor(middle.length / 2);

  let bestCount = 0;
  let worstCount = 0;
  let silverCount = 0;
  let bronzeCount = 0;

  referees.forEach((r) => {
    if (r.grade === bestGrade) bestCount++;
    else if (r.grade === worstGrade) worstCount++;
  });

  middle.forEach((ref, i) => {
    if (i < half) silverCount++;
    else bronzeCount++;
  });

  return [
    { name: 'Best', value: bestCount },
    { name: 'Worst', value: worstCount },
    { name: 'Silver', value: silverCount },
    { name: 'Bronze', value: bronzeCount },
  ];
}

/**
 * getGradeByAgeData
 * Groups referees by age and returns average grade per age
 */
export function getGradeByAgeData(referees: Referee[]) {
  const mapAge: Record<number, { sum: number; count: number }> = {};

  referees.forEach((r) => {
    if (!mapAge[r.age]) {
      mapAge[r.age] = { sum: 0, count: 0 };
    }
    mapAge[r.age].sum += r.grade;
    mapAge[r.age].count++;
  });

  // Convert to array sorted by age
  const result = Object.entries(mapAge).map(([ageStr, obj]) => {
    const age = parseInt(ageStr, 10);
    return {
      age,
      avgGrade: obj.sum / obj.count,
    };
  });
  result.sort((a, b) => a.age - b.age);

  return result;
}


  