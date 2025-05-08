import { AppDataSource } from '../config/database';

/**
 * This script runs a simple performance test on our optimized endpoints
 * It can be used to manually test the database performance before using JMeter
 */

async function runPerformanceTest() {
  try {
    // Connect to database
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Count records
    const refereeCount = await AppDataSource.query('SELECT COUNT(*) as count FROM Referees');
    const gameCount = await AppDataSource.query('SELECT COUNT(*) as count FROM Games');

    console.log(`Database contains ${refereeCount[0].count} referees and ${gameCount[0].count} games`);

    // Run the optimized query and measure time
    console.log('\nTesting statistical query performance:');
    
    // Test 1: Get statistics for all referees with at least 10 games
    console.time('Query 1: All Referees with 10+ games');
    const query1 = `
      SELECT 
        r.id as refereeId,
        r.firstName,
        r.lastName, 
        r.league,
        COUNT(g.id) as gameCount
      FROM Referees r
      LEFT JOIN Games g ON r.id = g.refereeId
      GROUP BY r.id, r.firstName, r.lastName, r.league
      HAVING COUNT(g.id) >= 10
      ORDER BY gameCount DESC
    `;
    const result1 = await AppDataSource.query(query1);
    console.timeEnd('Query 1: All Referees with 10+ games');
    console.log(`Found ${result1.length} referees with 10+ games`);

    // Test 2: Get statistics for referees in a specific league
    console.time('Query 2: NBA Referees with stats');
    const query2 = `
      SELECT 
        r.id as refereeId,
        r.firstName,
        r.lastName, 
        r.league,
        COUNT(g.id) as gameCount,
        SUM(CASE WHEN g.status = 'completed' THEN 1 ELSE 0 END) as completedGames
      FROM Referees r
      LEFT JOIN Games g ON r.id = g.refereeId
      WHERE r.league = 'NBA'
      GROUP BY r.id, r.firstName, r.lastName, r.league
      ORDER BY gameCount DESC
    `;
    const result2 = await AppDataSource.query(query2);
    console.timeEnd('Query 2: NBA Referees with stats');
    console.log(`Found ${result2.length} NBA referees`);

    // Test 3: Monthly games per location report
    console.time('Query 3: Location monthly report');
    const query3 = `
      WITH MonthlyGames AS (
        SELECT 
          location,
          MONTH(date) as monthNumber,
          COUNT(*) as gameCount
        FROM Games
        GROUP BY location, MONTH(date)
      )
      SELECT 
        location,
        SUM(gameCount) as totalGames
      FROM MonthlyGames
      GROUP BY location
      ORDER BY totalGames DESC
    `;
    const result3 = await AppDataSource.query(query3);
    console.timeEnd('Query 3: Location monthly report');
    console.log(`Found ${result3.length} unique locations`);

    console.log('\nPerformance test completed');
    process.exit(0);
  } catch (error) {
    console.error('Error running performance test:', error);
    process.exit(1);
  }
}

runPerformanceTest(); 