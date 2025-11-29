const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'medischedule',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'Nguyen@1904',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false,
        timezone: '+07:00'
    }
);

sequelize.authenticate()
    .then(() => {
        fs.writeFileSync('db_result.txt', 'Database connected successfully');
        process.exit(0);
    })
    .catch(err => {
        fs.writeFileSync('db_result.txt', 'Database connection failed: ' + err.message);
        process.exit(1);
    });
