const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FacilityService = sequelize.define('FacilityService', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    facilityId: { type: DataTypes.INTEGER, allowNull: false },
    specialtyId: { type: DataTypes.INTEGER },
    serviceName: { type: DataTypes.STRING, allowNull: false },
    serviceCode: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.TEXT },
    basePrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    serviceType: { 
        type: DataTypes.ENUM('CONSULTATION', 'LAB', 'IMAGING', 'PROCEDURE', 'OTHER'),
        defaultValue: 'CONSULTATION' 
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { 
    tableName: 'facility_services',
    timestamps: true 
});

module.exports = FacilityService;
