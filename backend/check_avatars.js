const { User } = require('./models');

async function check() {
    try {
        const doctors = await User.findAll({
            where: { role: 'doctor' },
            attributes: ['id', 'full_name', 'avatar']
        });
        console.log(JSON.stringify(doctors, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
