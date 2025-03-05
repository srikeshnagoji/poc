# MongoDB Nested Search Performance Testing Implementation Guide

## Project Overview
This project demonstrates MongoDB's performance characteristics when dealing with deeply nested search queries across multiple collections in a hierarchical data model. The implementation focuses on simulating a real-world enterprise structure with companies, branches, departments, and employees.

## Data Model Design

### Hierarchical Structure
- Company (Top Level)
  - Branch (Level 2)
    - Department (Level 3)
      - Employee (Level 4)

### Schema Design

1. **Company Schema**
```javascript
{
  name: String (indexed),
  industry: String (indexed),
  foundedYear: Number,
  revenue: Number
}
```

2. **Branch Schema**
```javascript
{
  name: String (indexed),
  company: ObjectId (indexed, ref: 'Company'),
  location: String (indexed),
  established: Date
}
```

3. **Department Schema**
```javascript
{
  name: String (indexed),
  branch: ObjectId (indexed, ref: 'Branch'),
  budget: Number,
  headCount: Number
}
```

4. **Employee Schema**
```javascript
{
  firstName: String (indexed),
  lastName: String (indexed),
  email: String (indexed, unique),
  department: ObjectId (indexed, ref: 'Department'),
  salary: Number,
  joinDate: Date,
  position: String (indexed)
}
```

## Data Generation Strategy

### Using Faker.js for Realistic Data
- Company names and industries using `faker.company`
- Location data using `faker.location`
- Employee details using `faker.person` and `faker.internet`
- Numerical data (salary, revenue) using `faker.number`

### Batch Processing Approach
- Companies: Single batch insertion
- Branches: Single batch insertion
- Departments: Single batch insertion
- Employees: Processed in batches of 1000 to manage memory

### Data Volume Configuration
```javascript
{
  companyCount: 100,
  branchesPerCompany: 5,
  deptsPerBranch: 8,
  employeesPerDept: 100
}
```

## Search Operations Implementation

### 1. Employees by Company Industry (3 Levels Deep)
- Uses MongoDB aggregation pipeline
- Multiple `$lookup` stages to traverse Company → Branch → Department → Employee
- Case-insensitive industry matching
- Projects relevant fields only

### 2. High-Salary Employees by Location (3 Levels Deep)
- Combines location filtering with salary threshold
- Traverses Branch → Department → Employee relationships
- Optimized projection for result set

### 3. Large Departments by Industry (2 Levels Deep)
- Filters departments by headcount
- Joins with company data for industry filtering
- Returns department details with company context

## Performance Optimization Techniques

1. **Indexing Strategy**
   - Created indexes on all frequently queried fields
   - Compound indexes for common query patterns
   - Indexes on foreign key fields for efficient joins

2. **Query Optimization**
   - Limited result sets to 100 records
   - Projected only necessary fields
   - Used efficient regex patterns for text searches

3. **Data Management**
   - Batch processing for large data insertions
   - Memory-efficient data generation
   - Proper error handling and cleanup

## API Endpoints

### Data Generation
```bash
POST /api/generate-data
Body: {
  "companyCount": 100,
  "branchesPerCompany": 5,
  "deptsPerBranch": 8,
  "employeesPerDept": 100
}
```

### Search Operations
1. **Industry-based Employee Search**
```bash
GET /api/search/employees-by-company-industry/:industry
```

2. **Location-based High-Salary Employee Search**
```bash
GET /api/search/high-salary-by-location/:location
```

3. **Industry-based Large Department Search**
```bash
GET /api/search/large-departments-by-industry/:industry
```

## Performance Metrics
Each search endpoint returns:
- Query execution time in milliseconds
- Result count
- Limited result set (max 100 records)

## Implementation Considerations

1. **Memory Management**
   - Batch processing for large datasets
   - Streaming responses for large result sets
   - Proper cleanup of temporary data

2. **Scalability**
   - Indexed fields for efficient queries
   - Limited result sets
   - Optimized data structure

3. **Maintainability**
   - Modular code structure
   - Clear separation of concerns
   - Comprehensive error handling

## Testing Approach

1. **Data Generation Testing**
   - Verify data integrity
   - Check relationships
   - Validate constraints

2. **Query Performance Testing**
   - Measure query execution times
   - Monitor memory usage
   - Test with various data volumes

3. **Edge Cases**
   - Handle missing data
   - Test with invalid inputs
   - Verify error responses