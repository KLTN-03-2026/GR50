const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NguoiDung, VaiTro, NguoiDung_VaiTro, BacSi, BenhNhan } = require('../models');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { email, username, password, full_name, phone, date_of_birth, address, role, specialty_id, experience_years, consultation_fee, bio } = req.body;

    if (!email || !password || !full_name || !phone) {
      return res.status(400).json({ detail: 'Missing required fields' });
    }

    if (role && role !== 'patient') {
      return res.status(403).json({ detail: 'Chỉ có thể đăng ký tài khoản bệnh nhân.' });
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
      SoDienThoai: phone,
      NgaySinh: date_of_birth,
      TrangThai: 'HoatDong'
    });

    const vaiTroMap = { 'patient': 'patient', 'doctor': 'doctor', 'admin': 'admin', 'department_head': 'department_head' };
    const vt = await VaiTro.findOne({ where: { MaVaiTro: vaiTroMap[role] || 'patient' } });

    if (vt) {
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
    }

    if (role === 'doctor' || role === 'department_head') {
      await BacSi.create({
        Id_NguoiDung: user.Id_NguoiDung,
        Id_ChuyenKhoa: specialty_id || null,
        SoNamKinhNghiem: experience_years || 0,
        PhiTuVan: consultation_fee || 0,
        GioiThieu: bio,
        TrangThai: 'NgungHoatDong'
      });
    } else if (role === 'patient') {
      await BenhNhan.create({
        Id_NguoiDung: user.Id_NguoiDung,
        SoDienThoaiLienHe: phone
      });
    }

    const tokenRole = role || 'patient';
    const token = jwt.sign({ sub: user.Id_NguoiDung, role: tokenRole }, process.env.JWT_SECRET || 'super_secret_jwt_key_123', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.Id_NguoiDung,
        email: user.Email,
        full_name: `${user.Ho} ${user.Ten}`,
        role: tokenRole
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await NguoiDung.findOne({
      where: { Email: login },
      include: [{ model: VaiTro, through: { attributes: [] } }]
    });

    if (!user || !(await bcrypt.compare(password, user.MatKhau))) {
      return res.status(401).json({ detail: 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!' });
    }

    const userRole = user.VaiTros && user.VaiTros.length > 0 ? user.VaiTros[0].MaVaiTro : 'patient';
    const token = jwt.sign({ sub: user.Id_NguoiDung, role: userRole }, process.env.JWT_SECRET || 'super_secret_jwt_key_123', { expiresIn: '7d' });

    let userDict = {
      id: user.Id_NguoiDung,
      email: user.Email,
      full_name: `${user.Ho} ${user.Ten}`,
      role: userRole,
      phone: user.SoDienThoai
    };

    if (userRole === 'admin') {
      userDict.admin_permissions = {
        can_manage_doctors: true,
        can_manage_patients: true,
        can_manage_appointments: true,
        can_view_stats: true,
        can_manage_specialties: true,
        can_create_admins: true
      };
    }

    res.json({ token, user: userDict });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
