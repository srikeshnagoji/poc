const { faker } = require('@faker-js/faker');

class ArangoDataGenerator {
  constructor(db) {
    this.db = db;
  }

  async generateAll(config) {
    const startTime = Date.now();
    const stats = {
      companies: 0,
      branches: 0,
      departments: 0,
      employees: 0,
      edges: 0
    };

    try {
      // Generate companies
      for (let i = 0; i < config.companyCount; i++) {
        const company = await this.createCompany();
        stats.companies++;

        // Generate branches for each company
        for (let j = 0; j < config.branchesPerCompany; j++) {
          const branch = await this.createBranch();
          stats.branches++;

          // Create company->branch edge
          await this.createEdge(
            "companies_branches",
            company._key,
            branch._key
          );
          stats.edges++;

          // Generate departments for each branch
          for (let k = 0; k < config.deptsPerBranch; k++) {
            const department = await this.createDepartment();
            stats.departments++;

            // Create branch->department edge
            await this.createEdge(
              "branches_departments",
              branch._key,
              department._key
            );
            stats.edges++;

            // Generate employees for each department
            for (let l = 0; l < config.employeesPerDept; l++) {
              const employee = await this.createEmployee();
              stats.employees++;

              // Create department->employee edge
              await this.createEdge(
                "departments_employees",
                department._key,
                employee._key
              );
              stats.edges++;
            }
          }
        }
      }

      const endTime = Date.now();
      return {
        timeMs: endTime - startTime,
        stats
      };
    } catch (error) {
      console.error('Data generation error:', error);
      throw error;
    }
  }

  async createCompany() {
    const company = {
      name: faker.company.name(),
      industry: faker.company.catchPhrase(),
      founded: faker.date.past().getFullYear(),
      revenue: faker.number.float({ min: 1000000, max: 1000000000, precision: 2 })
    };
    return this.db.collection('companies').save(company);
  }

  async createBranch() {
    const branch = {
      name: faker.company.name() + ' Branch',
      location: faker.location.city(),
      employeeCount: faker.number.int({ min: 50, max: 1000 }),
      established: faker.date.past().getFullYear()
    };
    return this.db.collection('branches').save(branch);
  }

  async createDepartment() {
    const department = {
      name: faker.commerce.department(),
      headCount: faker.number.int({ min: 10, max: 200 }),
      budget: faker.number.float({ min: 100000, max: 5000000, precision: 2 })
    };
    return this.db.collection('departments').save(department);
  }

  async createEmployee() {
    const employee = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      position: faker.person.jobTitle(),
      salary: faker.number.float({ min: 30000, max: 200000, precision: 2 }),
      hireDate: faker.date.past().toISOString()
    };
    return this.db.collection('employees').save(employee);
  }

  async createEdge(collectionName, fromKey, toKey) {
    const edge = {
      _from: `${collectionName.split("_")[0]}/${fromKey}`,
      _to: `${collectionName.split("_")[1]}/${toKey}`,
    };
    return this.db.collection(collectionName).save(edge);
  }
}

module.exports = ArangoDataGenerator;