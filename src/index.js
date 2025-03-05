require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const DataGenerator = require('./utils/dataGenerator');
const { Employee, Department, Branch, Company } = require('./models');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Set timeout for data generation requests
app.use('/api/generate-data', (req, res, next) => {
  // Set timeout to 10 minutes
  req.setTimeout(600000);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/company-poc', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Data Generation Endpoint
app.post('/api/generate-data', async (req, res) => {
  try {
    const config = {
      companyCount: req.body.companyCount || 100,
      branchesPerCompany: req.body.branchesPerCompany || 5,
      deptsPerBranch: req.body.deptsPerBranch || 8,
      employeesPerDept: req.body.employeesPerDept || 100
    };

    const result = await DataGenerator.generateAll(config);
    res.json(result);
  } catch (error) {
    console.error('Data generation error:', error);
    res.status(500).json({ error: 'Data generation failed' });
  }
});

// Search Endpoints with Different Query Patterns

// 1. Find employees by company industry (3 levels deep)
app.get('/api/search/employees-by-company-industry/:industry', async (req, res) => {
  try {
    const startTime = Date.now();
    const employees = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $lookup: {
          from: 'branches',
          localField: 'department.branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: '$branch' },
      {
        $lookup: {
          from: 'companies',
          localField: 'branch.company',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $match: {
          'company.industry': new RegExp(req.params.industry, 'i')
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          position: 1,
          salary: 1,
          'department.name': 1,
          'branch.name': 1,
          'company.name': 1,
          'company.industry': 1
        }
      }
    ]).limit(100);

    const endTime = Date.now();
    res.json({
      queryTimeMs: endTime - startTime,
      resultCount: employees.length,
      results: employees
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 2. Find high-salary employees in specific locations (3 levels deep)
app.get('/api/search/high-salary-by-location/:location', async (req, res) => {
  try {
    const startTime = Date.now();
    const employees = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $lookup: {
          from: 'branches',
          localField: 'department.branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: '$branch' },
      {
        $match: {
          'branch.location': new RegExp(req.params.location, 'i'),
          'salary': { $gt: 100000 }
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          position: 1,
          salary: 1,
          'department.name': 1,
          'branch.name': 1,
          'branch.location': 1
        }
      }
    ]).limit(100);

    const endTime = Date.now();
    res.json({
      queryTimeMs: endTime - startTime,
      resultCount: employees.length,
      results: employees
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 3. Find departments with high headcount in specific industry (2 levels deep)
app.get('/api/search/large-departments-by-industry/:industry', async (req, res) => {
  try {
    const startTime = Date.now();
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: '$branch' },
      {
        $lookup: {
          from: 'companies',
          localField: 'branch.company',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $match: {
          'company.industry': new RegExp(req.params.industry, 'i'),
          'headCount': { $gt: 50 }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          headCount: 1,
          budget: 1,
          'branch.name': 1,
          'company.name': 1,
          'company.industry': 1
        }
      }
    ]).limit(100);

    const endTime = Date.now();
    res.json({
      queryTimeMs: endTime - startTime,
      resultCount: departments.length,
      results: departments
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});