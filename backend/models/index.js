const sequelize = require('../config/database');
const User = require('./User');
const Specialty = require('./Specialty');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const AdminPermission = require('./AdminPermission');

// Define relationships here if not already defined in model files
// (They are defined in model files, but good to centralize or re-export)

module.exports = {
  sequelize,
  User,
  Specialty,
  Doctor,
  Patient,
  Appointment,
  AdminPermission
};
