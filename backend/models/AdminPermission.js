const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const AdminPermission = sequelize.define('AdminPermission', {
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
  can_manage_doctors: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_manage_patients: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_manage_appointments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_view_stats: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_manage_specialties: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_create_admins: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false,
  tableName: 'admin_permissions'
});



module.exports = AdminPermission;
