const models = require('../models');

async function migrate() {
    const cols = [
        { name: 'is_primary', type: 'BOOLEAN DEFAULT false' },
        { name: 'is_active', type: 'BOOLEAN DEFAULT true' },
        { name: 'supports_online', type: 'BOOLEAN DEFAULT true' },
        { name: 'supports_offline', type: 'BOOLEAN DEFAULT true' },
        { name: 'consultation_fee_online', type: 'DECIMAL(12,2) DEFAULT NULL' },
        { name: 'consultation_fee_offline', type: 'DECIMAL(12,2) DEFAULT NULL' }
    ];
    for (const c of cols) {
        try {
            await models.sequelize.query(`ALTER TABLE bacsi_phongkham ADD COLUMN ${c.name} ${c.type}`);
            console.log('Added', c.name);
        } catch(e) {
            console.log(c.name, 'exists or error', e.message);
        }
    }
    process.exit(0);
}
migrate();
