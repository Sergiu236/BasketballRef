// src/utils/stats.ts
import { Referee } from '../data/referees';

/**
 * getHighestGradeReferee
 * Returns the Referee with the highest grade (or null if none).
 */
export function getHighestGradeReferee(refs: Referee[]): Referee | null {
  if (refs.length === 0) return null;
  return refs.reduce((max, curr) => (curr.grade > max.grade ? curr : max));
}

/**
 * getLowestGradeReferee
 * Returns the Referee with the lowest grade (or null if none).
 */
export function getLowestGradeReferee(refs: Referee[]): Referee | null {
  if (refs.length === 0) return null;
  return refs.reduce((min, curr) => (curr.grade < min.grade ? curr : min));
}

/**
 * getAverageGrade
 * Returns the numeric average of all referee grades (0 if none).
 */
export function getAverageGrade(refs: Referee[]): number {
  if (refs.length === 0) return 0;
  const total = refs.reduce((sum, ref) => sum + ref.grade, 0);
  return total / refs.length;
}

/**
 * getClosestToAverageGradeReferee
 * Finds whichever Referee's grade is closest to the average
 * (returns null if no referees).
 */
export function getClosestToAverageGradeReferee(refs: Referee[]): Referee | null {
  if (refs.length === 0) return null;
  const avg = getAverageGrade(refs);
  let closestRef = refs[0];
  let minDiff = Math.abs(closestRef.grade - avg);

  for (let i = 1; i < refs.length; i++) {
    const diff = Math.abs(refs[i].grade - avg);
    if (diff < minDiff) {
      minDiff = diff;
      closestRef = refs[i];
    }
  }
  return closestRef;
}
