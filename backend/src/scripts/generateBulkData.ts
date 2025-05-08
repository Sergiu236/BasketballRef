import { faker } from '@faker-js/faker';
import { AppDataSource } from '../config/database';
import { Referee } from '../entities/Referee';
import { Game } from '../entities/Game';

// Helper function to format dates properly for SQL Server
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Initialize connection to database
async function generateData() {
  // Connect to database
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Repositories
    const refereeRepo = AppDataSource.getRepository(Referee);
    const gameRepo = AppDataSource.getRepository(Game);

    console.log('Starting data generation...');
    
    // Configuration
    const BATCH_SIZE = 100; // Reduced batch size to avoid SQL Server limitations
    const TOTAL_REFEREES = 10000;
    const TOTAL_GAMES = 100000;

    // Generate referees in batches
    console.log(`Generating ${TOTAL_REFEREES} referees...`);
    for (let i = 0; i < TOTAL_REFEREES; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_REFEREES - i);
      const refereeBatch: Referee[] = [];
      
      for (let j = 0; j < batchSize; j++) {
        const referee = new Referee();
        referee.firstName = faker.person.firstName();
        referee.lastName = faker.person.lastName();
        referee.league = faker.helpers.arrayElement(['NBA', 'LNBM', 'LNBF', 'Liga ACB', 'FIBA']);
        referee.age = faker.number.int({ min: 25, max: 65 });
        referee.grade = faker.number.int({ min: 1, max: 10 });
        
        // Use properly formatted dates
        const promoDate = faker.date.past({ years: 10 });
        referee.promovationDate = promoDate;
        
        referee.refereedGames = faker.number.int({ min: 0, max: 500 });
        referee.t1VsT2 = `${faker.company.name()} vs ${faker.company.name()}`;
        
        const matchDate = faker.date.recent({ days: 30 });
        referee.matchDate = matchDate;
        
        referee.photo = faker.image.url({ width: 200, height: 200 });
        
        refereeBatch.push(referee);
      }
      
      try {
        await refereeRepo.save(refereeBatch);
        console.log(`Inserted ${i + batchSize} referees`);
      } catch (error: any) {
        console.error('Error inserting referee batch:', error.message);
        // Continue with next batch
      }
    }
    
    // Get all referee IDs to assign games to
    const refereeIds = await refereeRepo
      .createQueryBuilder('ref')
      .select('ref.id')
      .getMany();
    
    if (refereeIds.length === 0) {
      throw new Error('No referees found in database. Cannot create games.');
    }
    
    // Generate games in batches
    console.log(`Generating ${TOTAL_GAMES} games...`);
    for (let i = 0; i < TOTAL_GAMES; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_GAMES - i);
      const gameBatch: Game[] = [];
      
      for (let j = 0; j < batchSize; j++) {
        const game = new Game();
        // Create date in SQL-friendly format
        game.date = faker.date.between({ from: '2020-01-01', to: '2024-12-31' });
        game.location = faker.location.city();
        game.status = faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled', 'in progress']);
        
        // Randomly assign to a referee
        const randomReferee = faker.helpers.arrayElement(refereeIds);
        game.referee = randomReferee;
        
        gameBatch.push(game);
      }
      
      try {
        await gameRepo.save(gameBatch);
        console.log(`Inserted ${i + batchSize} games`);
      } catch (error: any) {
        console.error('Error inserting game batch:', error.message);
        // Continue with next batch
      }
    }
    
    console.log('Data generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating data:', error);
    process.exit(1);
  }
}

// Run the data generation
generateData(); 