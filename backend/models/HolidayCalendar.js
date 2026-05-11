const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HolidayCalendar = sequelize.define('HolidayCalendar', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  facility_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'PhongKham', key: 'Id_PhongKham' }
  },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  name: { type: DataTypes.STRING(255) },
  is_closed: { type: DataTypes.BOOLEAN, defaultValue: true },
  note: { type: DataTypes.TEXT }
}, {
  tableName: 'holiday_calendars',
  timestamps: true,
  underscored: true
});

module.exports = HolidayCalendar;
