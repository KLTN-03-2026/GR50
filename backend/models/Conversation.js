const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Note: Doctor is also a User, but usually we link to the User table for auth. 
                     // However, the frontend sends `doctor_id` which might be the Doctor table ID or User ID.
                     // Looking at `DoctorConversationsTab` in frontend: `handleNewConversation(doctor.id)`.
                     // And `fetchDoctors` calls `/doctors/available`.
                     // `doctorController.getAll` returns `...d` (doctor object) which has `id` (Doctor ID) and `user_id`.
                     // So `doctor.id` in frontend is likely the Doctor table ID.
                     // But for simplicity and consistency, it's often better to link Users.
                     // Let's check `Doctor.js` to be sure.
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'closed'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  tableName: 'conversations'
});

module.exports = Conversation;
