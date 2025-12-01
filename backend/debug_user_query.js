const { User } = require('./models');
const fs = require('fs');

const logFile = 'backend/debug_user_out.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function testUserQuery() {
    try {
        fs.writeFileSync(logFile, 'Starting user debug...\n');

        // Test finding a user by ID (like authMiddleware)
        const userId = 4;
        log(`Fetching user by id: ${userId}`);
        const user = await User.findByPk(userId);
        if (user) {
            log('User found: ' + user.username);
        } else {
            log('User not found');
        }

        // Test finding user by email (like login)
        log('Fetching user by email...');
        const admin = await User.findOne({ where: { email: 'admin@medischedule.com' } });
        if (admin) {
            log('Admin found: ' + admin.username);
        } else {
            log('Admin not found');
        }

    } catch (error) {
        log('Error in testUserQuery: ' + error.message);
        log(JSON.stringify(error, null, 2));
    }
}

testUserQuery().then(() => {
    log('Done.');
    process.exit(0);
}).catch(err => {
    log('Top level error: ' + err.message);
    process.exit(1);
});
