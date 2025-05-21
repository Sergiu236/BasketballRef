import { AppDataSource } from '../config/database';

async function rebuildIndexes() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    /* 1.  DROP all old IDX_* indexes so nu se mai ciocnesc                    */
    console.log('Dropping legacy IDX_* indexes...');
    await AppDataSource.query(`
      DECLARE @sql NVARCHAR(MAX) =
        (SELECT STRING_AGG(
           'DROP INDEX ' + QUOTENAME(i.name) + ' ON '
           + QUOTENAME(OBJECT_SCHEMA_NAME(i.object_id)) + '.'
           + QUOTENAME(OBJECT_NAME(i.object_id)), '; ')
         FROM sys.indexes i
         WHERE i.name LIKE 'IDX\\_%' ESCAPE '\\');
      IF @sql IS NOT NULL EXEC (@sql);
    `);

    /* 2.  GAMES – index compozit & acoperitor                                */
    console.log('Creating new performant indexes…');

    // (refereeId, date) – include status pentru a evita lookup-uri
    await AppDataSource.query(`
      CREATE INDEX IX_Games_Referee_Date
        ON dbo.Games (refereeId, [date])
        INCLUDE (status);
      PRINT 'Created IX_Games_Referee_Date';
    `);

    // Dacă ai frecvent filtre pe status + date range (fără refereeId)
    await AppDataSource.query(`
      CREATE INDEX IX_Games_Status_Date
        ON dbo.Games (status, [date]);
      PRINT 'Created IX_Games_Status_Date';
    `);

    /* 3.  REFEREES – index compozit pe (league, id) și „covering” cu numele  */
    await AppDataSource.query(`
      CREATE INDEX IX_Referees_League_Id
        ON dbo.Referees (league, id)
        INCLUDE (firstName, lastName, grade);
      PRINT 'Created IX_Referees_League_Id';
    `);

    console.log('All new indexes created!\nRun JMeter again to measure ⏱️');
    process.exit(0);
  } catch (err) {
    console.error('Index rebuild failed:', err);
    process.exit(1);
  }
}

rebuildIndexes();
