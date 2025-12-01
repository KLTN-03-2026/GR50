const { Doctor, User, Specialty, Review } = require('./models');
const fs = require('fs');

const logFile = 'backend/debug_profile_out.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function testGetProfile() {
    try {
        fs.writeFileSync(logFile, 'Starting debug...\n');
        const userId = 4; // Based on the screenshot
        log(`Fetching profile for user_id: ${userId}`);

        let doctor = await Doctor.findOne({
            where: { user_id: userId },
            include: [
                { model: User, attributes: ['full_name', 'email', 'phone', 'address', 'avatar'] },
                { model: Specialty, attributes: ['name'] }
            ]
        });

        if (!doctor) {
            log('Doctor not found in Doctor table.');
        } else {
            log('Doctor found: ' + JSON.stringify(doctor.toJSON(), null, 2));
        }

        log('Fetching reviews...');
        const reviews = await Review.findAll({
            where: { doctor_id: userId },
            include: [{ model: User, as: 'Patient', attributes: ['full_name', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });
        log(`Found ${reviews.length} reviews.`);

    } catch (error) {
        log('Error in testGetProfile: ' + error.message);
        log(JSON.stringify(error, null, 2));
    }
}

testGetProfile().then(() => {
    log('Done.');
    process.exit(0);
}).catch(err => {
    log('Top level error: ' + err.message);
    process.exit(1);
});
