# Basketball Referee Backend

This is the backend for the Basketball Referee Management Application.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```
   Or use the batch file:
   ```
   run-dev.bat
   ```

## Testing

The backend uses Jest for testing. There are several ways to run the tests:

1. Run all tests:
   ```
   npm test
   ```
   Or use the batch file:
   ```
   run-tests.bat
   ```

2. Run tests in watch mode (tests will re-run when files change):
   ```
   npm run test:watch
   ```

3. Run tests with coverage report:
   ```
   npm run test:coverage
   ```

4. Run specific test suites:
   ```
   # Run API endpoint tests
   npm run test:api
   
   # Run controller tests
   npm run test:controller
   
   # Run validator tests
   npm run test:validator
   ```

## Test Structure

The tests are organized into the following categories:

1. **API Tests** (`tests/referees.test.ts`): Tests the HTTP endpoints and API responses
   - Tests CRUD operations through the API
   - Verifies correct status codes and response formats
   - Tests error handling for invalid requests

2. **Controller Tests** (`tests/refereesController.test.ts`): Tests the business logic
   - Tests controller functions directly
   - Verifies data manipulation and business rules
   - Tests error handling and edge cases

3. **Validator Tests** (`tests/refereeValidator.test.ts`): Tests data validation
   - Tests input validation rules
   - Verifies error messages for invalid data
   - Tests type checking and required fields

## API Endpoints

The API provides the following endpoints:

- `GET /api/referees` - Get all referees
- `GET /api/referees/:id` - Get a referee by ID
- `POST /api/referees` - Create a new referee
- `PUT /api/referees/:id` - Update a referee
- `DELETE /api/referees/:id` - Delete a referee

## Project Structure

- `src/controllers` - Controller functions for handling requests
- `src/routes` - Route definitions
- `src/models` - Data models
- `src/data` - Data storage
- `src/validators` - Validation functions
- `tests` - Test files

# Database Performance Testing

This project includes scripts for stress-testing and optimizing the database with large volumes of data.

## 1. Generate Test Data

Run the following command to generate 10,000 referees and 100,000 games:

```
npx ts-node src/scripts/generateBulkData.ts
```

This script will:
- Create 10,000 random referees with realistic data
- Create 100,000 games and assign them to random referees
- Data is inserted in batches to avoid memory issues

## 2. Add Database Optimizations

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

## 3. Test Query Performance

Run the built-in performance test to see the impact of your optimizations:

```
npx ts-node src/scripts/runDataTest.ts
```

This will run three complex queries and measure their execution time.

## 4. Test Optimized API Endpoints

The following optimized statistical endpoints are available:

- `/api/statistics/referees/games?minGames=10` - Get referees with at least 10 games
- `/api/statistics/referees/games?league=NBA` - Get stats for referees in the NBA
- `/api/statistics/locations/monthly` - Get monthly game counts by location

## 5. Testing with JMeter

To test the endpoints under load with JMeter:

1. Download Apache JMeter from https://jmeter.apache.org/download_jmeter.cgi
2. Launch JMeter
3. Create a new Test Plan with the following configuration:

### Thread Group Configuration
- Number of Threads (users): 100
- Ramp-up period: 10 seconds
- Loop Count: 5

### HTTP Request Configuration
Add these three HTTP requests:

1. Referee Games Statistics
   - Method: GET
   - URL: http://192.168.6.243:3001/api/statistics/referees/games
   - Parameters: minGames=10

2. League-specific Statistics
   - Method: GET
   - URL: http://192.168.6.243:3001/api/statistics/referees/games
   - Parameters: league=NBA

3. Monthly Location Report
   - Method: GET
   - URL: http://192.168.6.243:3001/api/statistics/locations/monthly

### Listeners to Add
- Summary Report
- View Results Tree
- Aggregate Report

4. Run the test to measure:
   - Throughput (requests per second)
   - Average response time
   - Error rate under load

## Performance Results

The optimization techniques should yield significant improvements:

1. Query execution time for 100,000 games:
   - Without indexes: ~800-1500ms
   - With indexes: ~100-300ms

2. JMeter results with 100 concurrent users:
   - Average response time: < 500ms
   - Throughput: > 50 requests/second
   - Error rate: < 1%

This demonstrates the system's ability to handle large datasets efficiently. 