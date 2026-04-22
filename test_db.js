require('dotenv').config({ path: './backend/.env' });
const { sequelize } = require('./backend/models');

async function test() {
    try {
        console.log('Testing DB connection...');
        console.log('DB Config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            name: process.env.DB_NAME
        });
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

test();
