const { faker } = require('@faker-js/faker');
const { Company, Branch, Department, Employee } = require('../models');

class DataGenerator {
  static async generateCompanies(count) {
    const CHUNK_SIZE = 1000;
    let allCompanies = [];
    
    for (let i = 0; i < count; i += CHUNK_SIZE) {
      const chunkSize = Math.min(CHUNK_SIZE, count - i);
      const companies = [];
      
      console.log(`Processing companies ${i + 1} to ${i + chunkSize} out of ${count}...`);
      
      for (let j = 0; j < chunkSize; j++) {
        companies.push({
          name: faker.company.name(),
          industry: faker.company.buzzPhrase(),
          foundedYear: faker.number.int({ min: 1900, max: 2023 }),
          revenue: faker.number.int({ min: 1000000, max: 1000000000 })
        });
      }
      
      const insertedCompanies = await Company.insertMany(companies);
      allCompanies = allCompanies.concat(insertedCompanies);
    }
    
    return allCompanies;
  }

  static async generateBranches(companies, branchesPerCompany) {
    const CHUNK_SIZE = 1000;
    let allBranches = [];
    
    for (let i = 0; i < companies.length; i += CHUNK_SIZE) {
      const companyChunk = companies.slice(i, i + CHUNK_SIZE);
      const branches = [];
      
      console.log(`Processing branches for companies ${i + 1} to ${i + companyChunk.length} out of ${companies.length}...`);
      
      for (const company of companyChunk) {
        for (let j = 0; j < branchesPerCompany; j++) {
          branches.push({
            name: `${faker.location.city()} Branch`,
            company: company._id,
            location: faker.location.country(),
            established: faker.date.past({ years: 20 })
          });
        }
      }
      
      const insertedBranches = await Branch.insertMany(branches);
      allBranches = allBranches.concat(insertedBranches);
    }
    
    return allBranches;
  }

  static async generateDepartments(branches, deptsPerBranch) {
    const CHUNK_SIZE = 1000;
    let allDepartments = [];
    const deptNames = ['HR', 'Finance', 'Engineering', 'Marketing', 'Sales', 'Operations', 'IT', 'Legal'];
    
    for (let i = 0; i < branches.length; i += CHUNK_SIZE) {
      const branchChunk = branches.slice(i, i + CHUNK_SIZE);
      const departments = [];
      
      console.log(`Processing departments for branches ${i + 1} to ${i + branchChunk.length} out of ${branches.length}...`);
      
      for (const branch of branchChunk) {
        for (let j = 0; j < deptsPerBranch; j++) {
          departments.push({
            name: deptNames[j % deptNames.length],
            branch: branch._id,
            budget: faker.number.int({ min: 100000, max: 1000000 }),
            headCount: faker.number.int({ min: 5, max: 100 })
          });
        }
      }
      
      const insertedDepartments = await Department.insertMany(departments);
      allDepartments = allDepartments.concat(insertedDepartments);
    }
    
    return allDepartments;
  }

  static async generateEmployees(departments, employeesPerDept) {
    const CHUNK_SIZE = 1000;
    let totalEmployees = 0;
    const positions = ['Manager', 'Senior Developer', 'Developer', 'Analyst', 'Associate', 'Director', 'Coordinator'];
    
    for (let i = 0; i < departments.length; i += CHUNK_SIZE) {
      const departmentChunk = departments.slice(i, i + CHUNK_SIZE);
      const employees = [];
      
      console.log(`Processing employees for departments ${i + 1} to ${i + departmentChunk.length} out of ${departments.length}...`);
      
      for (const department of departmentChunk) {
        for (let j = 0; j < employeesPerDept; j++) {
          const firstName = faker.person.firstName();
          const lastName = faker.person.lastName();
          const uniqueId = faker.string.alphanumeric(6);
          
          employees.push({
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${department._id.toString().slice(-4)}.${uniqueId}@company.com`,
            department: department._id,
            salary: faker.number.int({ min: 30000, max: 150000 }),
            joinDate: faker.date.past({ years: 5 }),
            position: positions[faker.number.int({ min: 0, max: positions.length - 1 })]
          });
        }
      }
      
      const insertedEmployees = await Employee.insertMany(employees);
      totalEmployees += insertedEmployees.length;
    }
    
    return totalEmployees;
  }

  static async generateAll(config) {
    const {
      companyCount = 100,
      branchesPerCompany = 5,
      deptsPerBranch = 8,
      employeesPerDept = 100
    } = config;

    console.log('Generating companies...');
    const companies = await this.generateCompanies(companyCount);
    
    console.log('Generating branches...');
    const branches = await this.generateBranches(companies, branchesPerCompany);
    
    console.log('Generating departments...');
    const departments = await this.generateDepartments(branches, deptsPerBranch);
    
    console.log('Generating employees...');
    const totalEmployees = await this.generateEmployees(departments, employeesPerDept);
    
    return {
      companiesGenerated: companies.length,
      branchesGenerated: branches.length,
      departmentsGenerated: departments.length,
      employeesGenerated: totalEmployees
    };
  }
}

module.exports = DataGenerator;