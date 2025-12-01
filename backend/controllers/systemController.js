const { SystemSetting } = require('../models');

exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.findAll();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body; // Expecting { key: value, key2: value2 }

        for (const [key, value] of Object.entries(settings)) {
            await SystemSetting.upsert({
                key,
                value: String(value)
            });
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

// Public endpoint to get specific public settings (like banner, contact info)
exports.getPublicSettings = async (req, res) => {
    try {
        const publicKeys = ['hospital_name', 'hospital_address', 'hospital_phone', 'hospital_email', 'banner_image', 'logo_image'];
        const settings = await SystemSetting.findAll({
            where: {
                key: publicKeys
            }
        });
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        console.error('Get public settings error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};
