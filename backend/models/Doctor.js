const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Specialty = require('./Specialty');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  specialty_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Specialty,
      key: 'id'
    }
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  available_slots: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'doctors'
});



module.exports = Doctor;
