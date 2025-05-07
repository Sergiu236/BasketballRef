// src/utils/filterReferees.ts
import { Referee } from '../data/referees';

/**
 * filterReferees
 * Filters and sorts an array of referees based on:
 *   - leagueFilter (league name)
 *   - sortOrder ('asc' | 'desc')
 *   - searchTerm (matches firstName + lastName)
 */
export function filterReferees(
  referees: Referee[],
  leagueFilter: string,
  sortOrder: 'asc' | 'desc',
  searchTerm: string
): Referee[] {
  return referees
    // 1) Filter by league if set
    .filter((ref) => {
      if (!leagueFilter) return true;
      return ref.league.toLowerCase() === leagueFilter.toLowerCase();
    })
    // 2) Filter by name (searchTerm)
    .filter((ref) => {
      const fullName = `${ref.firstName} ${ref.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    // 3) Sort by fullName asc or desc
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
}
