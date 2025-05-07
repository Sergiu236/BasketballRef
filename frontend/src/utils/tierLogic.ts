// src/utils/tierLogic.ts
import { Referee } from '../data/referees';

export type BadgeTier = 'best' | 'worst' | 'silver' | 'bronze';

/**
 * getTierMap
 * Given a list of referees (already filtered & sorted),
 * returns a map from referee.id -> 'best' | 'worst' | 'silver' | 'bronze'
 */
export function getTierMap(refs: Referee[]): Record<number, BadgeTier> {
  if (refs.length === 0) {
    return {};
  }

  const bestGrade = Math.max(...refs.map((r) => r.grade));
  const worstGrade = Math.min(...refs.map((r) => r.grade));

  // Middle group => not best or worst
  const middle = refs.filter((r) => r.grade !== bestGrade && r.grade !== worstGrade);
  middle.sort((a, b) => b.grade - a.grade);
  const halfIndex = Math.floor(middle.length / 2);

  // Build the map
  const tierMap: Record<number, BadgeTier> = {};

  // Best
  refs.filter(r => r.grade === bestGrade).forEach(r => {
    tierMap[r.id] = 'best';
  });

  // Worst
  refs.filter(r => r.grade === worstGrade).forEach(r => {
    tierMap[r.id] = 'worst';
  });

  // Middle => top half is silver, bottom half is bronze
  middle.forEach((ref, i) => {
    if (i < halfIndex) {
      tierMap[ref.id] = 'silver';
    } else {
      tierMap[ref.id] = 'bronze';
    }
  });

  return tierMap;
}
