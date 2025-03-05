const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  industry: { type: String, index: true },
  foundedYear: Number,
  revenue: Number
});

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  location: { type: String, index: true },
  established: Date
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  budget: Number,
  headCount: Number
});

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true, index: true },
  lastName: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  salary: Number,
  joinDate: Date,
  position: { type: String, index: true }
});

const Company = mongoose.model('Company', companySchema);
const Branch = mongoose.model('Branch', branchSchema);
const Department = mongoose.model('Department', departmentSchema);
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = {
  Company,
  Branch,
  Department,
  Employee
};