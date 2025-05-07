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