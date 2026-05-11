const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusinessHourConfig = sequelize.define('BusinessHourConfig', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  facility_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'PhongKham', key: 'Id_PhongKham' }
  },
  day_of_week: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    comment: '0 (Sunday) to 6 (Saturday)'
  },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  break_start: { type: DataTypes.TIME, allowNull: true },
  break_end: { type: DataTypes.TIME, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'business_hour_configs',
  timestamps: true,
  underscored: true
});

module.exports = BusinessHourConfig;
