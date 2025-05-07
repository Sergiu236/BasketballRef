import { describe, test, expect } from '@jest/globals';
import { filterReferees } from '../utils/filterReferees';
import { Referee } from '../data/referees';

describe('filterReferees', () => {
  const sampleReferees: Referee[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', league: 'NBA', age: 30, grade: 8, promovationDate: '01/01/2023', refereedGames: 12, t1VsT2: '', matchDate: '', photo: '/1.jpg' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', league: 'FIBA', age: 35, grade: 7, promovationDate: '02/15/2023', refereedGames: 45, t1VsT2: '', matchDate: '', photo: '/2.jpg' },
    { id: 3, firstName: 'Mike', lastName: 'Brown', league: 'NBA', age: 40, grade: 9, promovationDate: '03/10/2023', refereedGames: 88, t1VsT2: '', matchDate: '', photo: '/3.png' },
  ];

  test('returns all referees if no filters are applied', () => {
    const result = filterReferees(sampleReferees, '', 'asc', '');
    // Asc sort by full name: Jane Smith, John Doe, Mike Brown
    expect(result).toEqual([
      sampleReferees[1],
      sampleReferees[0],
      sampleReferees[2],
    ]);
  });

  test('filters by league', () => {
    const result = filterReferees(sampleReferees, 'NBA', 'asc', '');
    // Should only include John Doe + Mike Brown
    expect(result).toHaveLength(2);
  });

  test('filters by search term', () => {
    const result = filterReferees(sampleReferees, '', 'asc', 'mike');
    expect(result).toEqual([sampleReferees[2]]);
  });

  test('sorts in descending order', () => {
    const result = filterReferees(sampleReferees, '', 'desc', '');
    // Desc: Mike Brown, John Doe, Jane Smith
    expect(result).toEqual([
      sampleReferees[2],
      sampleReferees[0],
      sampleReferees[1],
    ]);
  });
});
