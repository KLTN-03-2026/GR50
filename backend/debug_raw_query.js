const sequelize = require('./config/database');
const fs = require('fs');

const logFile = 'backend/debug_raw_out.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function testRawQuery() {
    try {
        fs.writeFileSync(logFile, 'Starting raw query debug...\n');

        const sql = "SELECT `id`, `email`, `username`, `password`, `full_name`, `phone`, `date_of_birth`, `address`, `role`, `createdAt`, `updatedAt` FROM `users` AS `User` WHERE (`User`.`email` = 'admin@medischedule.com' OR `User`.`username` = 'admin@medischedule.com') LIMIT 1;";

        log('Executing SQL: ' + sql);
        const [results, metadata] = await sequelize.query(sql);
        log('Query successful. Results: ' + JSON.stringify(results));

    } catch (error) {
        log('Error in testRawQuery: ' + error.message);
        log('Code: ' + error.code);
        log('SQL Message: ' + error.sqlMessage);
    } finally {
        await sequelize.close();
    }
}

testRawQuery().then(() => {
    log('Done.');
}).catch(err => {
    log('Top level error: ' + err.message);
});
