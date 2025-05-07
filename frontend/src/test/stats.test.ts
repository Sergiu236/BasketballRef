import { describe, test, expect } from '@jest/globals';
import {
  getHighestGradeReferee,
  getLowestGradeReferee,
  getAverageGrade,
  getClosestToAverageGradeReferee
} from '../utils/stats';
import { Referee } from '../data/referees';

describe('stats utility', () => {
  const sampleRefs: Referee[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', league: 'NBA', age: 30, grade: 10, promovationDate: '', refereedGames: 0, t1VsT2: '', matchDate: '', photo: '' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', league: 'FIBA', age: 35, grade: 7, promovationDate: '', refereedGames: 0, t1VsT2: '', matchDate: '', photo: '' },
    { id: 3, firstName: 'Mike', lastName: 'Brown', league: 'LNBM', age: 40, grade: 9, promovationDate: '', refereedGames: 0, t1VsT2: '', matchDate: '', photo: '' },
  ];

  test('getHighestGradeReferee returns the highest grade', () => {
    const result = getHighestGradeReferee(sampleRefs);
    expect(result?.id).toBe(1); // John has grade 10
  });

  test('getLowestGradeReferee returns the lowest grade', () => {
    const result = getLowestGradeReferee(sampleRefs);
    expect(result?.id).toBe(2); // Jane has grade 7
  });

  test('getAverageGrade returns average grade', () => {
    const avg = getAverageGrade(sampleRefs); 
    // (10 + 7 + 9) / 3 = 8.6667
    expect(avg).toBeCloseTo(8.67, 2);
  });

  test('getClosestToAverageGradeReferee returns the closest match', () => {
    const closest = getClosestToAverageGradeReferee(sampleRefs);
    // The average is ~8.67, Mike is 9 => difference is 0.33
    // Jane is 7 => difference is 1.67
    // John is 10 => difference is 1.33
    // So Mike is the closest
    expect(closest?.id).toBe(3);
  });
});
