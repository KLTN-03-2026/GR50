const { PhongKham } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const clinics = await PhongKham.findAll();
        res.json(clinics);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng khám:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const clinic = await PhongKham.findByPk(req.params.id);
        if (!clinic) return res.status(404).json({ detail: 'Clinic not found' });
        res.json(clinic);
    } catch (error) {
        console.error('Lỗi khi lấy phòng khám:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.create = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ detail: 'Admin access required' });
        }
        const { name, phone, email, address, logo_url, banner_url, google_map_url } = req.body;
        const clinic = await PhongKham.create({
            TenPhongKham: name,
            SoDienThoai: phone,
            Email: email,
            DiaChi: address,
            UrlLogo: logo_url,
            UrlBanner: banner_url,
            GoogleMapUrl: google_map_url
        });
        res.status(201).json(clinic);
    } catch (error) {
        console.error('Lỗi tạo phòng khám:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.update = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ detail: 'Admin access required' });
        }
        const clinic = await PhongKham.findByPk(req.params.id);
        if (!clinic) return res.status(404).json({ detail: 'Clinic not found' });

        const { name, phone, email, address, logo_url, banner_url, google_map_url } = req.body;
        await clinic.update({
            TenPhongKham: name,
            SoDienThoai: phone,
            Email: email,
            DiaChi: address,
            UrlLogo: logo_url,
            UrlBanner: banner_url,
            GoogleMapUrl: google_map_url
        });
        res.json(clinic);
    } catch (error) {
        console.error('Lỗi sửa phòng khám:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.delete = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ detail: 'Admin access required' });
        }
        const clinic = await PhongKham.findByPk(req.params.id);
        if (!clinic) return res.status(404).json({ detail: 'Clinic not found' });

        await clinic.destroy();
        res.json({ success: true });
    } catch (error) {
        console.error('Lỗi xóa phòng khám:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ detail: 'Không thể xóa phòng khám vì đang có bác sĩ hoạt động tại cơ sở này.' });
        }
        res.status(500).json({ detail: 'Internal server error' });
    }
};
