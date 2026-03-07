const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('sqlite::memory:', {
  logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize;
