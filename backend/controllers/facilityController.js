const { PhongKham, BacSi, NguoiDung, ChuyenKhoa } = require('../models');

/**
 * GET /api/facilities - Public: list all facilities from PhongKham table.
 * Falls back to doctor NoiLamViec parsing if table is empty.
 */
exports.getAllFacilities = async (req, res) => {
    try {
        const clinics = await PhongKham.findAll({ order: [['Id_PhongKham', 'ASC']] });
        if (clinics.length > 0) {
            return res.json(clinics.map(c => ({
                id: c.Id_PhongKham,
                name: c.TenPhongKham,
                address: c.DiaChi,
                phone: c.SDT,
                email: c.Email,
                logo_url: c.UrlLogo,
                banner_url: c.UrlBanner,
                google_map_url: c.GoogleMapUrl
            })));
        }
        // Fallback: parse from BacSi.NoiLamViec
        const bacsis = await BacSi.findAll();
        const facilitiesMap = new Map();
        let idCounter = 1;
        bacsis.forEach(b => {
            if (!b.NoiLamViec) return;
            const parts = b.NoiLamViec.split(' - ');
            const name = parts[0];
            if (!facilitiesMap.has(name)) {
                facilitiesMap.set(name, { id: idCounter++, name, address: name, phone: '', email: '', logo_url: null, banner_url: null, google_map_url: null });
            }
        });
        res.json(Array.from(facilitiesMap.values()));
    } catch (error) {
        console.error('Error fetching facilities:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

/**
 * GET /api/facilities/:id - Get a single facility with its associated doctors.
 */
exports.getFacilityById = async (req, res) => {
    try {
        const { id } = req.params;

        // Try PhongKham first
        const clinic = await PhongKham.findByPk(id);
        if (clinic) {
            const doctors = await BacSi.findAll({
                where: { TrangThai: 'HoatDong' },
                include: [
                    { model: NguoiDung }, 
                    { model: ChuyenKhoa },
                    { 
                        model: PhongKham, 
                        where: { Id_PhongKham: id },
                        through: { attributes: [] }
                    }
                ]
            });
            return res.json({
                facility: {
                    id: clinic.Id_PhongKham,
                    name: clinic.TenPhongKham,
                    address: clinic.DiaChi,
                    phone: clinic.SDT,
                    email: clinic.Email,
                    logo_url: clinic.UrlLogo,
                    banner_url: clinic.UrlBanner,
                    google_map_url: clinic.GoogleMapUrl
                },
                doctors: doctors.map(doc => ({
                    id: doc.Id_BacSi,
                    user_id: doc.Id_NguoiDung,
                    full_name: `${doc.NguoiDung.Ho} ${doc.NguoiDung.Ten}`,
                    avatar: doc.NguoiDung.AnhDaiDien,
                    phone: doc.NguoiDung.SoDienThoai,
                    specialty_name: doc.ChuyenKhoa ? doc.ChuyenKhoa.TenChuyenKhoa : '',
                    experience_years: doc.SoNamKinhNghiem,
                    consultation_fee: doc.PhiTuVan
                }))
            });
        }

        return res.status(404).json({ detail: 'Không tìm thấy cơ sở y tế' });
    } catch (error) {
        console.error('Error fetching facility by id:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};
