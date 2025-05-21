// src/models/Referee.ts

export interface Referee {
    id: number;
    firstName: string;
    lastName: string;
    league: string;
    age: number;
    grade: number;
    promovationDate: Date;
    refereedGames: number;
    t1VsT2: string;
    matchDate: Date | null;
    photo: string;
  }
  