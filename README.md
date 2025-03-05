# MongoDB Nested Search Performance POC

This application demonstrates MongoDB's performance with deeply nested search queries across multiple collections.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (Make sure MongoDB server is running locally)

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a .env file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/company-poc
   PORT=3000
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Testing the Application

1. Generate test data:
   ```bash
   curl -X POST http://localhost:3000/api/generate-data \
   -H "Content-Type: application/json" \
   -d '{
     "companyCount": 100,
     "branchesPerCompany": 5,
     "deptsPerBranch": 8,
     "employeesPerDept": 100
   }'
   ```

2. Test search endpoints:

   a. Find employees by company industry:
   ```bash
   curl http://localhost:3000/api/search/employees-by-company-industry/technology
   ```

   b. Find high-salary employees by location:
   ```bash
   curl http://localhost:3000/api/search/high-salary-by-location/usa
   ```

   c. Find large departments by industry:
   ```bash
   curl http://localhost:3000/api/search/large-departments-by-industry/finance
   ```

Each search endpoint returns:
- Query execution time in milliseconds
- Number of results found
- Actual result data (limited to 100 records)