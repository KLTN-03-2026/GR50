const { Specialty } = require('./models');
const fs = require('fs');

async function checkSpecialtyImages() {
    try {
        const specialties = await Specialty.findAll();
        const log = specialties.map(s => `${s.name}: ${s.image}`).join('\n');
        console.log(log);
        fs.writeFileSync('backend/specialty_images_log.txt', log);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSpecialtyImages();
