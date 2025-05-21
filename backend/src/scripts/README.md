# Database Performance Testing

This folder contains scripts for generating test data, adding performance optimizations, and running tests on your SQL Server database.

## Step 1: Generate Test Data

Run the following command to generate 10,000 referees and 100,000 games:

```
npx ts-node src/scripts/generateBulkData.ts
```

This script will:
- Create 10,000 random referees with realistic data
- Create 100,000 games and assign them to random referees
- Data is inserted in batches to avoid memory issues

## Step 2: Add Database Optimizations

Run the following command to add optimized indexes to your database:

```
npx ts-node src/scripts/createIndexes.ts
```

This script will add the following indexes:
- `IDX_Games_RefereeId` - Speeds up referee-related queries
- `IDX_Games_Date` - Improves date filtering and sorting
- `IDX_Games_Status` - Helps with status filtering
- `IDX_Referees_League` - Optimizes league-based filtering
- `IDX_Referees_Grade` - Speeds up grade-based filtering
- `IDX_Referees_Names` - Composite index for name searches

## Step 3: Test Query Performance

Run the built-in performance test to see the impact of your optimizations:

```
npx ts-node src/scripts/runDataTest.ts
```

This will run three complex queries and measure their execution time.

## Step 4: Testing with JMeter

To test the endpoints under load with JMeter:

1. Download Apache JMeter from https://jmeter.apache.org/download_jmeter.cgi
2. Launch JMeter
3. Create a new Test Plan with the following structure:

```
Test Plan
└── Thread Group (100 Users)
    ├── HTTP Request (Referee Games)
    │   └── URL: http://192.168.6.243:3001/api/statistics/referees/games?minGames=10
    ├── HTTP Request (Specific League)
    │   └── URL: http://192.168.6.243:3001/api/statistics/referees/games?league=NBA
    ├── HTTP Request (Monthly Location Report)
    │   └── URL: http://192.168.6.243:3001/api/statistics/locations/monthly
    └── Summary Report
```

4. Run the test with 100 concurrent users to simulate load
5. Analyze the response times in the Summary Report

## Results Analysis

Typical results after optimization:

1. Query execution time for 100,000 games:
   - Without indexes: ~800-1500ms
   - With indexes: ~100-300ms

2. JMeter results with 100 concurrent users:
   - Avg response time: < 500ms
   - Throughput: > 50 requests/second

# Testing Scripts

This directory contains utility scripts for testing the application.

## Simulating High User Activity

There are two scripts available to simulate high user activity:

### Option 1: Using the standalone script (Recommended)

The `simulateHighActivityStandalone.ts` script is a self-contained script that doesn't depend on other parts of the application. This is the recommended approach:

```bash
# In development:
ts-node src/scripts/simulateHighActivityStandalone.ts [userId] [numOperations]

# With npm script:
npm run ts:run -- src/scripts/simulateHighActivityStandalone.ts [userId] [numOperations]
```

### Option 2: Using the regular script

The `simulateHighActivity.ts` script uses the logging service but might require application code to be free of TypeScript errors:

```bash
ts-node src/scripts/simulateHighActivity.ts [userId] [numOperations]
```

Parameters:
- `userId` (optional): The ID of the user to simulate activities for (default: 1)
- `numOperations` (optional): The number of operations to perform (default: 10)

For example, to simulate 20 operations for user with ID 2:
```bash
ts-node src/scripts/simulateHighActivityStandalone.ts 2 20
```

### What it does

1. The script will generate the specified number of random CRUD operations (create, read, update, delete) for the given user ID
2. These operations will be logged in the database through the `LoggingService`
3. The monitoring service (which runs every minute) will detect the high activity
4. The user will be added to the monitored users list 