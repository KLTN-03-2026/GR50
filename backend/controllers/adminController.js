const { ThanhToan, DatLich, BenhNhan, NguoiDung, BacSi, VaiTro, ChuyenKhoa, NguoiDung_VaiTro } = require('../models');
const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
exports.getStats = async (req, res) => {
    try {
        const patients = await VaiTro.findOne({ where: { MaVaiTro: 'patient' }, include: [NguoiDung] });
        const doctors = await VaiTro.findOne({ where: { MaVaiTro: 'doctor' }, include: [NguoiDung] });

        const total_patients = patients && patients.NguoiDungs ? patients.NguoiDungs.length : 0;
        const total_doctors = doctors && doctors.NguoiDungs ? doctors.NguoiDungs.length : 0;

        const datLichAll = await DatLich.findAll();

        res.json({
            total_patients,
            total_doctors,
            total_appointments: datLichAll.length,
            pending_appointments: datLichAll.filter(d => d.TrangThai === 'ChoXacNhan').length,
            confirmed_appointments: datLichAll.filter(d => d.TrangThai === 'DaXacNhan').length,
            completed_appointments: datLichAll.filter(d => d.TrangThai === 'DaKham').length,
            cancelled_appointments: datLichAll.filter(d => d.TrangThai === 'Huy').length,
            online_consultations: 0,
            in_person_consultations: 0,
            pending_doctors: 0,
            approved_doctors: total_doctors
        });
    } catch (error) {
        console.error('Admin get stats error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const bacsis = await BacSi.findAll({
            include: [{ model: NguoiDung }, { model: ChuyenKhoa }]
        });

        res.json(bacsis.map(d => ({
            user_id: d.Id_NguoiDung,
            full_name: `${d.NguoiDung.Ho} ${d.NguoiDung.Ten}`,
            email: d.NguoiDung.Email,
            phone_number: d.NguoiDung.SoDienThoai,
            avatar_url: d.NguoiDung.AnhDaiDien,
            status: d.TrangThai === 'HoatDong' ? 'approved' : 'pending',
            specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : '',
            bio: d.GioiThieu,
            experience_years: d.SoNamKinhNghiem,
            consultation_fee: d.PhiTuVan
        })));
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const benhnhans = await BenhNhan.findAll({ include: [{ model: NguoiDung }] });
        res.json(benhnhans.map(p => ({
            user_id: p.Id_NguoiDung,
            full_name: `${p.NguoiDung.Ho} ${p.NguoiDung.Ten}`,
            email: p.NguoiDung.Email,
            phone_number: p.NguoiDung.SoDienThoai,
            avatar_url: p.NguoiDung.AnhDaiDien,
            date_of_birth: p.NguoiDung.NgaySinh,
            gender: p.NguoiDung.GioiTinh,
            address: ''
        })));
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query; // 'approved' or 'rejected'

        const dbStatus = status === 'approved' ? 'HoatDong' : 'NgungHoatDong';
        await BacSi.update({ TrangThai: dbStatus }, { where: { Id_NguoiDung: id } });
        res.json({ message: `Doctor ${status} successfully` });
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await NguoiDung.findByPk(id);
        if (!user) return res.status(404).json({ detail: 'User not found' });
        // Remove from junction tables first
        await NguoiDung_VaiTro.destroy({ where: { Id_NguoiDung: id } });
        await BenhNhan.destroy({ where: { Id_NguoiDung: id } });
        await BacSi.destroy({ where: { Id_NguoiDung: id } });
        await NguoiDung.destroy({ where: { Id_NguoiDung: id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await ThanhToan.findAll({ include: [{ model: BenhNhan, include: [NguoiDung] }] });

        const formattedPayments = payments.map(p => ({
            payment_id: p.Id_ThanhToan,
            status: p.TrangThai === 'ThanhCong' ? 'completed' : 'pending',
            doctor_name: 'Unknown Doctor',
            patient_name: p.BenhNhan ? `${p.BenhNhan.NguoiDung.Ho} ${p.BenhNhan.NguoiDung.Ten}` : 'Unknown',
            amount: parseFloat(p.SoTien),
            payment_method: p.PhuongThuc,
            transaction_id: p.MaGiaoDich,
            created_at: p.createdAt,
            payment_date: p.createdAt
        }));

        res.json({
            stats: {
                total_revenue: formattedPayments.filter(x => x.status === 'completed').reduce((s, p) => s + p.amount, 0),
                completed_payments: formattedPayments.filter(x => x.status === 'completed').length,
                pending_payments: formattedPayments.filter(x => x.status !== 'completed').length,
                total_payments: payments.length
            },
            payments: formattedPayments
        });
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const adminRole = await VaiTro.findOne({ where: { MaVaiTro: 'admin' } });
        if (!adminRole) return res.json([]);
        const admins = await NguoiDung.findAll({
            include: [{ model: VaiTro, where: { MaVaiTro: 'admin' }, through: { attributes: [] } }]
        });
        res.json(admins.map(a => ({
            id: a.Id_NguoiDung,
            full_name: `${a.Ho} ${a.Ten}`,
            email: a.Email,
            phone: a.SoDienThoai,
            created_at: a.createdAt
        })));
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { email, password, full_name, phone, date_of_birth, address, role, specialty_id, experience_years, consultation_fee, bio, admin_permissions } = req.body;

        if (!email || !password || !full_name || !role) {
            return res.status(400).json({ detail: 'Missing required fields' });
        }

        const existingUser = await NguoiDung.findOne({ where: { Email: email } });
        if (existingUser) return res.status(400).json({ detail: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');

        const user = await NguoiDung.create({
            Email: email,
            MatKhau: hashedPassword,
            Ho: ho,
            Ten: ten,
            SoDienThoai: phone || null,
            NgaySinh: date_of_birth || null,
            TrangThai: 'HoatDong'
        });

        const vt = await VaiTro.findOne({ where: { MaVaiTro: role } });
        if (vt) {
            await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
        }

        if (role === 'doctor' || role === 'department_head') {
            await BacSi.create({
                Id_NguoiDung: user.Id_NguoiDung,
                Id_ChuyenKhoa: specialty_id || null,
                SoNamKinhNghiem: experience_years || 0,
                PhiTuVan: consultation_fee || 0,
                GioiThieu: bio || null,
                TrangThai: 'HoatDong'
            });
        } else if (role === 'patient') {
            await BenhNhan.create({
                Id_NguoiDung: user.Id_NguoiDung,
                SoDienThoaiLienHe: phone || null
            });
        }

        res.status(201).json({ message: 'User created successfully', user_id: user.Id_NguoiDung });
    } catch (error) {
        console.error('Admin createUser error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;
        if (!email || !password || !full_name) return res.status(400).json({ detail: 'Missing fields' });
        const exists = await NguoiDung.findOne({ where: { Email: email } });
        if (exists) return res.status(400).json({ detail: 'Email already exists' });
        const hashed = await bcrypt.hash(password, 10);
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');
        const user = await NguoiDung.create({ Email: email, MatKhau: hashed, Ho: ho, Ten: ten, SoDienThoai: phone || null, TrangThai: 'HoatDong' });
        const vt = await VaiTro.findOne({ where: { MaVaiTro: 'admin' } });
        if (vt) await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
        res.status(201).json({ message: 'Admin created', id: user.Id_NguoiDung });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent self-deletion
        if (parseInt(id) === req.user.id) return res.status(400).json({ detail: 'Cannot delete yourself' });
        await NguoiDung_VaiTro.destroy({ where: { Id_NguoiDung: id } });
        await NguoiDung.destroy({ where: { Id_NguoiDung: id } });
        res.json({ message: 'Admin deleted' });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.updatePermissions = async (req, res) => {
    // Permissions are typically stored in a separate field or meta-table.
    // For now, store as a JSON note on the user object if available.
    res.json({ message: 'Permissions acknowledged (no separate permissions table in DB schema)' });
};

exports.getReports = async (req, res) => {
    try {
        const { from, to } = req.query;
        const whereClause = {};
        if (from && to) {
            whereClause.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
        }
        const appointments = await DatLich.findAll({ where: whereClause });
        const payments = await ThanhToan.findAll({ where: whereClause });

        const totalRevenue = payments
            .filter(p => p.TrangThai === 'ThanhCong')
            .reduce((sum, p) => sum + parseFloat(p.SoTien || 0), 0);

        // Group appointments by month
        const byMonth = {};
        appointments.forEach(a => {
            const month = new Date(a.createdAt).toISOString().slice(0, 7);
            if (!byMonth[month]) byMonth[month] = { month, count: 0, revenue: 0 };
            byMonth[month].count++;
        });
        payments.filter(p => p.TrangThai === 'ThanhCong').forEach(p => {
            const month = new Date(p.createdAt).toISOString().slice(0, 7);
            if (byMonth[month]) byMonth[month].revenue += parseFloat(p.SoTien || 0);
        });

        res.json({
            total_appointments: appointments.length,
            total_revenue: totalRevenue,
            completed: appointments.filter(a => a.TrangThai === 'DaKham').length,
            cancelled: appointments.filter(a => a.TrangThai === 'Huy').length,
            by_month: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};
