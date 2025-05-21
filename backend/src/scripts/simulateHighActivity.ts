import { LoggingService } from '../services/loggingService';
import { LogAction, EntityType } from '../entities/Log';
import { dataSource } from '../index';

/**
 * Script to simulate a user performing a high number of CRUD operations
 * This can be used to test the monitoring system
 */
async function simulateHighActivity() {
  // Make sure database is connected
  if (!dataSource.isInitialized) {
    try {
      await dataSource.initialize();
      console.log('Database connection initialized');
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      return;
    }
  }

  const userId = process.argv[2] ? parseInt(process.argv[2]) : 1;
  const numOperations = process.argv[3] ? parseInt(process.argv[3]) : 10;
  
  console.log(`Simulating ${numOperations} operations for user ID ${userId}...`);
  
  const operations = [
    LogAction.CREATE,
    LogAction.READ,
    LogAction.UPDATE,
    LogAction.DELETE
  ];
  
  const entities = [
    EntityType.REFEREE,
    EntityType.GAME
  ];
  
  // Perform operations in quick succession
  for (let i = 0; i < numOperations; i++) {
    const action = operations[Math.floor(Math.random() * operations.length)];
    const entityType = entities[Math.floor(Math.random() * entities.length)];
    const entityId = Math.floor(Math.random() * 100) + 1;
    
    try {
      await LoggingService.logAction(
        userId,
        action,
        entityType,
        entityId,
        `Simulated ${action} operation on ${entityType} #${entityId}`
      );
      
      console.log(`[${i+1}/${numOperations}] Logged: ${action} on ${entityType} #${entityId} by user ${userId}`);
    } catch (error) {
      console.error(`Failed to log operation #${i+1}:`, error);
    }
  }
  
  console.log('Simulation completed!');
  console.log('Wait about 1 minute for the monitoring service to detect the activity');
  console.log('Then log in as an admin and check the monitored users list');
  
  // Close the database connection
  await dataSource.destroy();
}

// Run the simulation
simulateHighActivity()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Simulation failed:', error);
    process.exit(1);
  }); 