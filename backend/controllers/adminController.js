const { ThanhToan, DatLich, BenhNhan, NguoiDung, BacSi, VaiTro, ChuyenKhoa, NguoiDung_VaiTro } = require('../models');
const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');

const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const generateEmail = (fullName) => {
    if (!fullName) return `user.${Date.now()}@gmail.com`;
    const cleanName = removeAccents(fullName.toLowerCase().trim());
    const parts = cleanName.split(/\s+/);
    return `${parts.join('.')}@gmail.com`;
};

const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // 8 character random string
};

exports.getStats = async (req, res) => {
    try {
        // Global User Counts
        const total_users = await NguoiDung.count();
        const total_doctors = await BacSi.count();
        const approved_doctors = await BacSi.count({ where: { TrangThai: 'HoatDong' } });
        const total_patients = await BenhNhan.count();

        // Global Appointment Stats
        const total_appointments = await DatLich.count();
        const pending_appointments = await DatLich.count({ where: { TrangThai: 'ChoXacNhan' } });
        const confirmed_appointments = await DatLich.count({ where: { TrangThai: 'DaXacNhan' } });
        const completed_appointments = await DatLich.count({ where: { TrangThai: 'DaKham' } });
        const cancelled_appointments = await DatLich.count({ where: { TrangThai: 'Huy' } });

        // Global Revenue
        const payments = await ThanhToan.findAll({ where: { TrangThai: 'ThanhCong' } });
        const total_revenue = payments.reduce((sum, p) => sum + parseFloat(p.SoTien || 0), 0);

        res.json({
            total_users,
            total_patients,
            total_doctors,
            approved_doctors,
            total_appointments,
            pending_appointments,
            confirmed_appointments,
            completed_appointments,
            cancelled_appointments,
            total_revenue,
            active_sessions: 0 // Mocked for now
        });
    } catch (error) {
        console.error('AdminGlobalStats Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi lấy thống kê hệ thống' });
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
        if (!user) return res.status(404).json({ detail: 'Không tìm thấy người dùng' });

        // Update user status instead of deleting
        await user.update({ TrangThai: 'Khoa' });

        // If it's a doctor, also update doctor status
        await BacSi.update({ TrangThai: 'NgungHoatDong' }, { where: { Id_NguoiDung: id } });

        res.json({ message: 'Tài khoản người dùng đã được khóa thành công.' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi khóa tài khoản' });
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
            created_at: p.NgayTao,
            payment_date: p.NgayTao
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
            created_at: a.NgayTao
        })));
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const {
            email, password, full_name, phone, role,
            specialty_id, experience_years, consultation_fee, bio,
            management_specialty_id
        } = req.body;

        if (!full_name || !role) {
            return res.status(400).json({ detail: 'Thiếu thông tin bắt buộc (Họ tên, Vai trò).' });
        }

        const generatedEmail = generateEmail(full_name);
        const generatedPassword = password || generatePassword();
        const finalEmail = email || generatedEmail;

        const existingUser = await NguoiDung.findOne({ where: { Email: finalEmail } });
        if (existingUser) return res.status(400).json({ detail: 'Email đã tồn tại trong hệ thống.' });

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');

        // Universal Provisioning: One user record
        const user = await NguoiDung.create({
            Email: finalEmail,
            MatKhau: hashedPassword,
            Ho: ho,
            Ten: ten,
            SoDienThoai: phone || null,
            TrangThai: 'HoatDong',
            YeuCauDoiMatKhau: true,
            // Staff role is operational, no department management scope assigned by default
            Id_ChuyenKhoa_QuanLy: null
        });

        // Assign Role
        const vt = await VaiTro.findOne({ where: { MaVaiTro: role } });
        if (vt) {
            await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
        }

        // Provision specific profile based on role
        if (role === 'doctor') {
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

        res.status(201).json({
            message: 'Tạo người dùng thành công',
            user_id: user.Id_NguoiDung,
            temp_password: generatedPassword
        });
    } catch (error) {
        console.error('Admin.createUser Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi tạo người dùng' });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;
        if (!email || !password || !full_name) {
            return res.status(400).json({ detail: 'Thiếu thông tin bắt buộc (Email, Mật khẩu, Họ tên).' });
        }

        const exists = await NguoiDung.findOne({ where: { Email: email } });
        if (exists) return res.status(400).json({ detail: 'Email đã tồn tại.' });

        const hashed = await bcrypt.hash(password, 10);
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');

        const user = await NguoiDung.create({
            Email: email,
            MatKhau: hashed,
            Ho: ho,
            Ten: ten,
            SoDienThoai: phone || null,
            TrangThai: 'HoatDong'
        });

        const vt = await VaiTro.findOne({ where: { MaVaiTro: 'admin' } });
        if (vt) {
            await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
        }

        res.status(201).json({ message: 'Tạo tài khoản quản trị viên thành công', id: user.Id_NguoiDung });
    } catch (error) {
        console.error('Admin.createAdmin Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi tạo quản trị viên' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ detail: 'Không thể tự khóa tài khoản của chính mình' });
        }
        const user = await NguoiDung.findByPk(id);
        if (!user) return res.status(404).json({ detail: 'Không tìm thấy quản trị viên' });

        await user.update({ TrangThai: 'Khoa' });
        res.json({ message: 'Đã khóa tài khoản quản trị viên thành công' });
    } catch (error) {
        console.error('Admin.deleteAdmin Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi khóa quản trị viên' });
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
            whereClause.NgayTao = { [Op.between]: [new Date(from), new Date(to)] };
        }

        const appointments = await DatLich.findAll({ where: whereClause });
        const payments = await ThanhToan.findAll({ where: whereClause });

        const totalRevenue = payments
            .filter(p => p.TrangThai === 'ThanhCong')
            .reduce((sum, p) => sum + parseFloat(p.SoTien || 0), 0);

        const byMonth = {};
        appointments.forEach(a => {
            const date = new Date(a.NgayTao);
            if (!isNaN(date.getTime())) {
                const month = date.toISOString().slice(0, 7);
                if (!byMonth[month]) byMonth[month] = { month, count: 0, revenue: 0 };
                byMonth[month].count++;
            }
        });

        payments.filter(p => p.TrangThai === 'ThanhCong').forEach(p => {
            const date = new Date(p.NgayTao);
            if (!isNaN(date.getTime())) {
                const month = date.toISOString().slice(0, 7);
                if (byMonth[month]) byMonth[month].revenue += parseFloat(p.SoTien || 0);
            }
        });

        res.json({
            total_appointments: appointments.length,
            total_revenue: totalRevenue,
            completed: appointments.filter(a => a.TrangThai === 'DaKham').length,
            cancelled: appointments.filter(a => a.TrangThai === 'Huy').length,
            by_month: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
        });
    } catch (error) {
        console.error('Admin.getReports Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi xuất báo cáo' });
    }
};

exports.getAIDiagnoses = async (req, res) => {
    try {
        // Admin view: Global monitoring of AI diagnoses
        // Assuming a model or table for AI logs/sessions exists
        // For now, we reuse the pattern but across all specialties
        const logs = await sequelize.query(`
            SELECT nd.Ho, nd.Ten, nd.Email, ck.TenChuyenKhoa, dl.NgayKham, dl.KhungGio, dl.LyDoKham
            FROM datlich dl
            JOIN nguoidung nd ON dl.Id_NguoiDung = nd.Id_NguoiDung
            LEFT JOIN bacsi bs ON dl.Id_BacSi = bs.Id_BacSi
            LEFT JOIN chuyenkhoa ck ON bs.Id_ChuyenKhoa = ck.Id_ChuyenKhoa
            WHERE dl.LyDoKham LIKE '%AI:%'
            ORDER BY dl.NgayKham DESC
            LIMIT 50
        `, { type: sequelize.QueryTypes.SELECT });

        res.json({
            detail: 'Giám sát chẩn đoán AI toàn hệ thống',
            diagnoses: logs.map(l => ({
                patient: `${l.Ho} ${l.Ten}`,
                email: l.Email,
                specialty: l.TenChuyenKhoa || 'Chưa phân khoa',
                date: l.NgayKham,
                time: l.KhungGio,
                ai_note: l.LyDoKham
            }))
        });
    } catch (error) {
        console.error('Admin.getAIDiagnoses Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi giám sát AI' });
    }
};
