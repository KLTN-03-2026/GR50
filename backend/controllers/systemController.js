const { PhongKham } = require('../models');

/**
 * GET /api/system - returns basic system/hospital settings.
 * Currently returns clinic #1 as the "main hospital" if available.
 */
exports.getSettings = async (req, res) => {
    try {
        const clinic = await PhongKham.findOne({ order: [['id', 'ASC']] });
        res.json({
            site_name: clinic ? clinic.TenPhongKham : 'BookingCare',
            hospital_phone: clinic ? clinic.SDT : '1900 1234',
            hospital_email: clinic ? clinic.Email : 'support@bookingcare.vn',
            hospital_address: clinic ? clinic.DiaChi : 'Đà Nẵng, Việt Nam'
        });
    } catch (error) {
        // If PhongKham table doesn't exist yet, return defaults
        res.json({
            site_name: 'BookingCare',
            hospital_phone: '1900 1234',
            hospital_email: 'support@bookingcare.vn',
            hospital_address: 'Đà Nẵng, Việt Nam'
        });
    }
};

exports.updateSettings = async (req, res) => {
    res.json({ message: 'Use /api/clinics endpoints to manage clinic information' });
};

exports.getPublicSettings = async (req, res) => {
    try {
        const clinic = await PhongKham.findOne({ order: [['id', 'ASC']] });
        res.json({
            site_name: clinic ? clinic.TenPhongKham : 'BookingCare',
            hospital_phone: clinic ? clinic.SDT : '1900 1234',
            hospital_email: clinic ? clinic.Email : 'support@bookingcare.vn',
            hospital_address: clinic ? clinic.DiaChi : 'Đà Nẵng, Việt Nam'
        });
    } catch (error) {
        res.json({ site_name: 'BookingCare' });
    }
};
