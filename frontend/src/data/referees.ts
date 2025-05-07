export interface Referee {
    id: number;
    firstName: string;
    lastName: string;
    league: string;
    age: number;
    grade: number;
    promovationDate: string;
    refereedGames: number;
    t1VsT2: string;
    matchDate: string;
    photo: string;
  }
  
  // Hard-coded array of referees
  export const referees: Referee[] = [
    { id: 1, firstName: 'Viktor', lastName: 'Popescu', league: 'NBA', age: 35, grade: 8, promovationDate: '01/01/2020', refereedGames: 120, t1VsT2: 'Lakers vs Bulls', matchDate: '03/14/2025', photo: '/ref1.jpg' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', league: 'Liga ACB', age: 31, grade: 7, promovationDate: '02/15/2021', refereedGames: 45, t1VsT2: 'Real vs Barca', matchDate: '04/20/2025', photo: '/ref2.jpg' },
    { id: 3, firstName: 'Carlos', lastName: 'Martinez', league: 'FIBA', age: 40, grade: 9, promovationDate: '03/10/2019', refereedGames: 88, t1VsT2: 'Juventus vs Milan', matchDate: '05/08/2025', photo: '/ref3.png' },
    { id: 4, firstName: 'Emily', lastName: 'Brown', league: 'LNBF', age: 23, grade: 6, promovationDate: '05/22/2020', refereedGames: 60, t1VsT2: 'Bayern vs Dortmund', matchDate: '06/15/2025', photo: '/ref4.jpg' },
    { id: 5, firstName: 'Robert', lastName: 'Wilson', league: 'FIBA', age: 27, grade: 7, promovationDate: '09/30/2018', refereedGames: 98, t1VsT2: 'PSG vs Lyon', matchDate: '07/10/2025', photo: '/ref5.jpg' },
    { id: 6, firstName: 'Sarah', lastName: 'Davis', league: 'NBA', age: 29, grade: 8, promovationDate: '11/05/2022', refereedGames: 33, t1VsT2: 'LA Galaxy vs NYCFC', matchDate: '08/25/2025', photo: '/ref6.jpg' },
  
    { id: 7, firstName: 'Mihai', lastName: 'Ionescu', league: 'LNBM', age: 38, grade: 8, promovationDate: '06/12/2017', refereedGames: 110, t1VsT2: 'Steaua vs Dinamo', matchDate: '09/12/2025', photo: '/ref7.jpg' },
    { id: 8, firstName: 'Ana', lastName: 'Popa', league: 'LNBF', age: 34, grade: 7, promovationDate: '04/03/2018', refereedGames: 75, t1VsT2: 'Craiova Women vs Cluj Women', matchDate: '10/05/2025', photo: '/ref8.jpg' },
    { id: 9, firstName: 'Luis', lastName: 'Garcia', league: 'Liga ACB', age: 42, grade: 9, promovationDate: '08/20/2016', refereedGames: 140, t1VsT2: 'Madrid vs Valencia', matchDate: '11/15/2025', photo: '/ref9.jpg' },
    { id: 10, firstName: 'James', lastName: 'Anderson', league: 'NBA', age: 36, grade: 8, promovationDate: '12/10/2019', refereedGames: 130, t1VsT2: 'Heat vs Celtics', matchDate: '12/01/2025', photo: '/ref10.jpg' },
    { id: 11, firstName: 'Sofia', lastName: 'Radu', league: 'LNBM', age: 30, grade: 7, promovationDate: '07/08/2020', refereedGames: 65, t1VsT2: 'Timisoara vs Oradea', matchDate: '01/20/2026', photo: '/ref11.jpg' },
    { id: 12, firstName: 'Elena', lastName: 'Stoica', league: 'LNBF', age: 28, grade: 7, promovationDate: '03/25/2021', refereedGames: 58, t1VsT2: 'Pitesti Women vs Brasov Women', matchDate: '02/18/2026', photo: '/ref12.jpg' },
    { id: 13, firstName: 'Marco', lastName: 'Silva', league: 'FIBA', age: 45, grade: 10, promovationDate: '10/14/2015', refereedGames: 160, t1VsT2: 'Italy vs Spain', matchDate: '03/30/2026', photo: '/ref13.png' },
    { id: 14, firstName: 'David', lastName: 'Lee', league: 'NBA', age: 39, grade: 9, promovationDate: '02/02/2018', refereedGames: 150, t1VsT2: 'Warriors vs Nuggets', matchDate: '04/22/2026', photo: '/ref14.jpg' },
    { id: 15, firstName: 'Carlos', lastName: 'Costa', league: 'Liga ACB', age: 41, grade: 9, promovationDate: '09/09/2016', refereedGames: 145, t1VsT2: 'Barcelona vs Baskonia', matchDate: '05/10/2026', photo: '/ref15.jpg' },
  ];
  
  