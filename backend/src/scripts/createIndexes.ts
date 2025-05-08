import { AppDataSource } from '../config/database';

async function createIndexes() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Create indexes for better query performance
    console.log('Adding performance indexes...');

    // Add indexes to the Games table
    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Games_RefereeId' AND object_id = OBJECT_ID('Games'))
      BEGIN
        CREATE INDEX IDX_Games_RefereeId ON Games (refereeId);
        PRINT 'Created index IDX_Games_RefereeId';
      END
    `);

    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Games_Date' AND object_id = OBJECT_ID('Games'))
      BEGIN
        CREATE INDEX IDX_Games_Date ON Games (date);
        PRINT 'Created index IDX_Games_Date';
      END
    `);

    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Games_Status' AND object_id = OBJECT_ID('Games'))
      BEGIN
        CREATE INDEX IDX_Games_Status ON Games (status);
        PRINT 'Created index IDX_Games_Status';
      END
    `);

    // Add indexes to the Referees table
    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Referees_League' AND object_id = OBJECT_ID('Referees'))
      BEGIN
        CREATE INDEX IDX_Referees_League ON Referees (league);
        PRINT 'Created index IDX_Referees_League';
      END
    `);

    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Referees_Grade' AND object_id = OBJECT_ID('Referees'))
      BEGIN
        CREATE INDEX IDX_Referees_Grade ON Referees (grade);
        PRINT 'Created index IDX_Referees_Grade';
      END
    `);

    // Composite index for name-based searches
    await AppDataSource.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IDX_Referees_Names' AND object_id = OBJECT_ID('Referees'))
      BEGIN
        CREATE INDEX IDX_Referees_Names ON Referees (lastName, firstName);
        PRINT 'Created index IDX_Referees_Names';
      END
    `);

    console.log('All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

// Run the index creation
createIndexes(); 