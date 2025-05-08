import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';

/**
 * Gets statistics about games per referee, optimized for performance
 * This endpoint demonstrates a complex query optimized for the database
 */
export const getRefereeGameStatistics = async (req: Request, res: Response) => {
  try {
    const minGames = parseInt(req.query.minGames as string) || 0;
    const leagueFilter = req.query.league as string;
    
    // Using a direct SQL query with joins and grouping
    // This avoids multiple round-trips to the database
    let query = `
      SELECT 
        r.id as refereeId,
        r.firstName,
        r.lastName, 
        r.league,
        r.grade,
        COUNT(g.id) as gameCount,
        MIN(g.date) as firstGame,
        MAX(g.date) as lastGame,
        SUM(CASE WHEN g.status = 'completed' THEN 1 ELSE 0 END) as completedGames,
        SUM(CASE WHEN g.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledGames,
        AVG(CAST(DATEDIFF(day, g.date, GETDATE()) as float)) as avgDaysSinceGame
      FROM Referees r
      LEFT JOIN Games g ON r.id = g.refereeId
    `;
    
    const whereConditions = [];
    const queryParams: any[] = [];
    
    // Apply filters
    if (leagueFilter) {
      whereConditions.push('r.league = @0');
      queryParams.push(leagueFilter);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Group by referee and filter by minimum games
    query += `
      GROUP BY r.id, r.firstName, r.lastName, r.league, r.grade
      HAVING COUNT(g.id) >= ${minGames}
      ORDER BY gameCount DESC, r.lastName ASC
    `;
    
    console.time('Statistics Query');
    const result = await AppDataSource.query(query, queryParams);
    console.timeEnd('Statistics Query');
    
    // Return with performance metrics
    res.json({
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error getting referee game statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
};

/**
 * Gets a performance report of busy locations by month
 * This shows another optimized query
 */
export const getLocationMonthlyReport = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    
    // Get game statistics by location and month using SQL Server's PIVOT
    const query = `
      WITH MonthlyGames AS (
        SELECT 
          location,
          MONTH(date) as monthNumber,
          COUNT(*) as gameCount
        FROM Games
        WHERE YEAR(date) = ${year}
        GROUP BY location, MONTH(date)
      )
      SELECT 
        location,
        ISNULL([1], 0) as Jan,
        ISNULL([2], 0) as Feb,
        ISNULL([3], 0) as Mar,
        ISNULL([4], 0) as Apr,
        ISNULL([5], 0) as May,
        ISNULL([6], 0) as Jun,
        ISNULL([7], 0) as Jul,
        ISNULL([8], 0) as Aug,
        ISNULL([9], 0) as Sep,
        ISNULL([10], 0) as Oct,
        ISNULL([11], 0) as Nov,
        ISNULL([12], 0) as Dec,
        SUM(ISNULL([1], 0) + ISNULL([2], 0) + ISNULL([3], 0) + ISNULL([4], 0) + 
            ISNULL([5], 0) + ISNULL([6], 0) + ISNULL([7], 0) + ISNULL([8], 0) + 
            ISNULL([9], 0) + ISNULL([10], 0) + ISNULL([11], 0) + ISNULL([12], 0)) as totalGames
      FROM MonthlyGames
      PIVOT (
        SUM(gameCount)
        FOR monthNumber IN ([1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12])
      ) as PivotTable
      GROUP BY 
        location,
        [1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12]
      ORDER BY totalGames DESC
    `;
    
    console.time('Location Report Query');
    const result = await AppDataSource.query(query);
    console.timeEnd('Location Report Query');
    
    res.json({
      year,
      count: result.length,
      data: result.slice(0, 20) // Return top 20 locations
    });
  } catch (error) {
    console.error('Error getting location report:', error);
    res.status(500).json({ error: 'Failed to retrieve location report' });
  }
}; 