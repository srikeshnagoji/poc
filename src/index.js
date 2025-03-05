require('dotenv').config();
const express = require("express");
const cors = require('cors');
const { connectToArangoDB } = require("./config/arangoConfig");
const ArangoDataGenerator = require("./utils/arangoDataGenerator");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Set timeout for data generation requests
app.use("/api/arango/generate-data", (req, res, next) => {
  // Set timeout to 10 minutes
  req.setTimeout(600000);
  next();
});

// Initialize ArangoDB connection
let db;
connectToArangoDB().then((database) => {
  db = database;
  console.log('ArangoDB connection initialized');
}).catch(err => console.error('Failed to initialize ArangoDB:', err));

// Data Generation Endpoint
app.post("/api/arango/generate-data", async (req, res) => {
  try {
    const config = {
      companyCount: req.body.companyCount || 100,
      branchesPerCompany: req.body.branchesPerCompany || 5,
      deptsPerBranch: req.body.deptsPerBranch || 8,
      employeesPerDept: req.body.employeesPerDept || 100,
    };

    const dataGenerator = new ArangoDataGenerator(db);
    const result = await dataGenerator.generateAll(config);
    res.json(result);
  } catch (error) {
    console.error("Data generation error:", error);
    res.status(500).json({ error: "Data generation failed" });
  }
});

// Search Endpoints

// 1. Find employees by company industry
app.get(
  "/api/arango/search/employees-by-company-industry/:industry",
  async (req, res) => {
    try {
      const startTime = Date.now();
      const query = `
      FOR company IN companies
        FILTER CONTAINS(LOWER(company.industry), LOWER(@industry))
        FOR branch IN OUTBOUND company company_branches
          FOR department IN OUTBOUND branch branch_departments
            FOR employee IN OUTBOUND department department_employees
              LIMIT 100
              RETURN {
                _id: employee._id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                position: employee.position,
                salary: employee.salary,
                department: { name: department.name },
                branch: { name: branch.name },
                company: { 
                  name: company.name,
                  industry: company.industry
                }
              }
    `;

      const cursor = await db.query(query, { industry: req.params.industry });
      const employees = await cursor.all();

      const endTime = Date.now();
      res.json({
        queryTimeMs: endTime - startTime,
        resultCount: employees.length,
        results: employees,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  }
);

// 2. Find high-salary employees in specific locations
app.get(
  "/api/arango/search/high-salary-by-location/:location",
  async (req, res) => {
    try {
      const startTime = Date.now();
      const query = `
      FOR branch IN branches
        FILTER LIKE(branch.location, CONCAT('%', @location, '%'), true)
        FOR department IN OUTBOUND branch branch_departments
          FOR employee IN OUTBOUND department department_employees
            FILTER employee.salary > 100000
            LIMIT 100
            RETURN {
              _id: employee._id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              position: employee.position,
              salary: employee.salary,
              department: { name: department.name },
              branch: { 
                name: branch.name,
                location: branch.location
              }
            }
    `;

      const cursor = await db.query(query, { location: req.params.location });
      const employees = await cursor.all();

      const endTime = Date.now();
      res.json({
        queryTimeMs: endTime - startTime,
        resultCount: employees.length,
        results: employees,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  }
);

// 3. Find departments with high headcount in specific industry
app.get(
  "/api/arango/search/large-departments-by-industry/:industry",
  async (req, res) => {
    try {
      const startTime = Date.now();
      const query = `
      FOR company IN companies
        FILTER LIKE(company.industry, CONCAT('%', @industry, '%'), true)
        FOR branch IN OUTBOUND company company_branches
          FOR department IN OUTBOUND branch branch_departments
            FILTER department.headCount > 50
            LIMIT 100
            RETURN {
              _id: department._id,
              name: department.name,
              headCount: department.headCount,
              budget: department.budget,
              branch: { name: branch.name },
              company: { 
                name: company.name,
                industry: company.industry
              }
            }
    `;

      const cursor = await db.query(query, { industry: req.params.industry });
      const departments = await cursor.all();

      const endTime = Date.now();
      res.json({
        queryTimeMs: endTime - startTime,
        resultCount: departments.length,
        results: departments,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  }
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ArangoDB Server is running on port ${PORT}`);
});