
const sequelize = require('../config/database');

async function fixPrecision() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        await sequelize.query('ALTER TABLE PhongKham MODIFY ToaDo_Lat DECIMAL(11, 8)');
        await sequelize.query('ALTER TABLE PhongKham MODIFY ToaDo_Lng DECIMAL(11, 8)');
        
        console.log('Precision fixed.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing precision:', error);
        process.exit(1);
    }
}

fixPrecision();
