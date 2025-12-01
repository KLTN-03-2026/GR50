const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const AIModerationContent = sequelize.define('AIModerationContent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_question: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ai_response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    response_template: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    detected_keyword: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending'
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    feedback_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    confidence_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'ai_moderation_contents'
});



module.exports = AIModerationContent;
