import { describe, test, expect } from '@jest/globals';
import {
  getHighestGradeReferee,
  getLowestGradeReferee,
  getAverageGrade,
  getClosestToAverageGradeReferee
} from '../utils/stats';  // or wherever your stats.ts is
import { Referee } from '../data/referees';

describe('stats utility', () => {
  // Sample data from before
  const sampleRefs: Referee[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', league: 'NBA', age: 30, grade: 10, promovationDate: '', refereedGames: 0, t1VsT2: '', matchDate: '', photo: '' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', league: 'FIBA', age: 35, grade: 7, promovationDate: '', refereedGames: 0, t1VsT2: '', matchDate: '', photo: '' },
    { id: 3, firstName: 'Mike', lastName: 'Brown', league: 'LNBM', age: 40, grade: 9, promovationDate: '', refereedGames: 0, t1VsT2: '', matchDate: '', photo: '' },
  ];

  // Already tested normal usage, but let's cover edge cases:

  test('empty array returns null or 0 where appropriate', () => {
    expect(getHighestGradeReferee([])).toBeNull();
    expect(getLowestGradeReferee([])).toBeNull();
    expect(getAverageGrade([])).toBe(0);
    expect(getClosestToAverageGradeReferee([])).toBeNull();
  });

  test('multiple same highest grade referees', () => {
    const data: Referee[] = [
      { ...sampleRefs[0], id: 101, grade: 9 },
      { ...sampleRefs[1], id: 102, grade: 9 },
      { ...sampleRefs[2], id: 103, grade: 8 },
    ];
    // two highest (grade=9)
    const highest = getHighestGradeReferee(data);
    // Either one could come back, but let's check if it's one with grade=9
    expect(highest?.grade).toBe(9);
  });

  test('multiple same lowest grade referees', () => {
    const data: Referee[] = [
      { ...sampleRefs[0], id: 201, grade: 5 },
      { ...sampleRefs[1], id: 202, grade: 5 },
      { ...sampleRefs[2], id: 203, grade: 7 },
    ];
    // two worst (grade=5)
    const lowest = getLowestGradeReferee(data);
    expect(lowest?.grade).toBe(5);
  });

  test('average grade for all 10, verifying all lines', () => {
    // (10 + 7 + 9) / 3 = 8.6667
    const avg = getAverageGrade(sampleRefs);
    expect(avg).toBeCloseTo(8.67, 2);

    // Then check closest to average
    const closest = getClosestToAverageGradeReferee(sampleRefs);
    // 10 => diff ~1.33
    // 7 => diff ~1.67
    // 9 => diff ~0.67
    // so '9' is the closest
    expect(closest?.grade).toBe(9);
  });
});
