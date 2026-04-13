const { NguoiDung, BacSi, BenhNhan, VaiTro, DatLich, ChuyenKhoa, NguoiDung_VaiTro, PhongKham } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

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


const getHeadSpecialty = async (userId) => {
    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    return doctor ? doctor.Id_ChuyenKhoa : null;
};

exports.createUser = async (req, res) => {
    try {
        const { email, password, full_name, phone, role, specialty_id, experience_years, consultation_fee, bio } = req.body;
        const headSpecialtyId = await getHeadSpecialty(req.user.id);

        // Enforce head's specialty for new doctors if they are just a department head (not admin)
        const isHead = req.user.role === 'department_head';
        const targetSpecialtyId = (req.user.role === 'admin') ? (specialty_id || headSpecialtyId) : headSpecialtyId;


        const generatedEmail = generateEmail(full_name);
        const generatedPassword = generatePassword();

        const finalEmail = email || generatedEmail;
        const finalPassword = password || generatedPassword;

        const existingUser = await NguoiDung.findOne({ where: { Email: finalEmail } });
        if (existingUser) return res.status(400).json({ detail: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(finalPassword, 10);
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');

        const user = await NguoiDung.create({
            Email: finalEmail,
            MatKhau: hashedPassword,
            MatKhauHienThi: finalPassword, // Store for display
            Ho: ho,
            Ten: ten,
            SoDienThoai: phone || null,
            TrangThai: 'HoatDong',
            YeuCauDoiMatKhau: true // Force change for newly created users
        });



        const vt = await VaiTro.findOne({ where: { MaVaiTro: role } });
        if (vt) await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });

        if (role === 'doctor') {
            await BacSi.create({
                Id_NguoiDung: user.Id_NguoiDung,
                Id_ChuyenKhoa: targetSpecialtyId,
                SoNamKinhNghiem: experience_years || 0,
                PhiTuVan: consultation_fee || 0,
                GioiThieu: bio || null,
                TrangThai: 'HoatDong'
            });
        } else if (role === 'patient') {
            await BenhNhan.create({ Id_NguoiDung: user.Id_NguoiDung, SoDienThoaiLienHe: phone || null });
        }

        res.status(201).json({ message: 'User created successfully', id: user.Id_NguoiDung });
    } catch (error) {
        console.error('Department Head Create User Error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const specialtyId = await getHeadSpecialty(req.user.id);
        const whereClause = specialtyId ? { Id_ChuyenKhoa: specialtyId } : {};

        const total_doctors = await BacSi.count({ where: { ...whereClause, TrangThai: 'HoatDong' } });
        const pending_doctors = await BacSi.count({ where: { ...whereClause, TrangThai: { [Op.ne]: 'HoatDong' } } });
        const total_patients = await BenhNhan.count();

        const doctorsInSpecialty = await BacSi.findAll({ where: whereClause, attributes: ['Id_BacSi'] });
        const docIds = doctorsInSpecialty.map(d => d.Id_BacSi);

        const total_appointments = await DatLich.count({ where: { Id_BacSi: { [Op.in]: docIds } } });
        const completed_appointments = await DatLich.count({ where: { Id_BacSi: { [Op.in]: docIds }, TrangThai: 'DaKham' } });

        res.json({
            total_doctors,
            approved_doctors: total_doctors,
            pending_doctors,
            total_patients,
            total_appointments,
            completed_appointments
        });
    } catch (error) {
        console.error('Department Head Stats Error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const patients = await BenhNhan.findAll({
            include: [{ model: NguoiDung }]
        });

        const result = patients.map(p => ({
            id: p.Id_NguoiDung,
            full_name: `${p.NguoiDung.Ho} ${p.NguoiDung.Ten}`,
            email: p.NguoiDung.Email,
            phone: p.NguoiDung.SoDienThoai,
            created_at: p.createdAt || p.NguoiDung.createdAt,
            password_display: p.NguoiDung.MatKhauHienThi // Added for display
        }));


        res.json(result);
    } catch (error) {
        console.error('Department Head Get Patients Error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.removePatient = async (req, res) => {
    try {
        const { id } = req.params;
        await BenhNhan.destroy({ where: { Id_NguoiDung: id } });
        res.json({ message: 'Patient removed successfully' });
    } catch (error) {
        console.error('Department Head Remove Patient Error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const specialtyId = await getHeadSpecialty(req.user.id);
        const whereClause = specialtyId ? { Id_ChuyenKhoa: specialtyId } : {};

        const doctors = await BacSi.findAll({
            where: whereClause,
            include: [{ model: NguoiDung }, { model: ChuyenKhoa }, { model: PhongKham }]
        });

        const result = doctors.map(d => ({
            user_id: d.Id_NguoiDung,
            status: d.TrangThai === 'HoatDong' ? 'approved' : 'pending',
            specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : '',
            bio: d.GioiThieu,
            experience_years: d.SoNamKinhNghiem,
            consultation_fee: d.PhiTuVan,
            clinic_name: d.PhongKham ? d.PhongKham.TenPhongKham : d.NoiLamViec,
            user_info: {
                full_name: `${d.NguoiDung.Ho} ${d.NguoiDung.Ten}`,
                email: d.NguoiDung.Email,
                avatar: d.NguoiDung.AnhDaiDien,
                password_display: d.NguoiDung.MatKhauHienThi // Added for display
            }

        }));

        res.json(result);
    } catch (error) {
        console.error('Department Head Get Doctors Error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query;
        const dbStatus = status === 'approved' ? 'HoatDong' : 'NgungHoatDong';
        await BacSi.update({ TrangThai: dbStatus }, { where: { Id_NguoiDung: id } });
        res.json({ message: `Doctor ${status} successfully` });
    } catch (error) {
        console.error('Department Head Approve Doctor Error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.removeDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await BacSi.destroy({ where: { Id_NguoiDung: id } });
        res.json({ message: 'Doctor removed successfully' });
    } catch (error) {
        console.error('Department Head Remove Doctor Error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};
