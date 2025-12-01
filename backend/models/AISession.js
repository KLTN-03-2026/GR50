const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const AISession = sequelize.define('AISession', {
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
    moderation_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    model_used: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    confidence_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'ai_sessions'
});



module.exports = AISession;
