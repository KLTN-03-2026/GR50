const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NguoiDung, VaiTro, NguoiDung_VaiTro, BacSi, BenhNhan } = require('../models');
const { Op } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);




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
      phone: user.SoDienThoai,
      must_change_password: user.YeuCauDoiMatKhau // Added flag
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

exports.googleLogin = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    let email, ho, ten, avatar;

    if (credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload['email'];
      ho = payload['family_name'] || '';
      ten = payload['given_name'] || '';
      avatar = payload['picture'];
    } else if (accessToken) {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const payload = response.data;
      email = payload.email;
      ho = payload.family_name || '';
      ten = payload.given_name || '';
      avatar = payload.picture;
    }

    let user = await NguoiDung.findOne({
      where: { Email: email },
      include: [{ model: VaiTro, through: { attributes: [] } }]
    });

    if (!user) {
      user = await NguoiDung.create({
        Email: email,
        Ho: ho,
        Ten: ten,
        AnhDaiDien: avatar,
        TrangThai: 'HoatDong',
        MatKhau: await bcrypt.hash(Math.random().toString(36), 10)
      });

      const vt = await VaiTro.findOne({ where: { MaVaiTro: 'patient' } });
      if (vt) {
        await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
      }

      await BenhNhan.create({
        Id_NguoiDung: user.Id_NguoiDung,
        SoDienThoaiLienHe: ''
      });

      user = await NguoiDung.findByPk(user.Id_NguoiDung, {
        include: [{ model: VaiTro, through: { attributes: [] } }]
      });
    }

    const userRole = user.VaiTros && user.VaiTros.length > 0 ? user.VaiTros[0].MaVaiTro : 'patient';
    const token = jwt.sign({ sub: user.Id_NguoiDung, role: userRole }, process.env.JWT_SECRET || 'super_secret_jwt_key_123', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.Id_NguoiDung,
        email: user.Email,
        full_name: `${user.Ho} ${user.Ten}`,
        role: userRole,
        avatar: user.AnhDaiDien
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ detail: 'Google authentication failed' });
  }
};

exports.facebookLogin = async (req, res) => {

  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ detail: 'Missing access token' });
    }

    // Verify Facebook Token and get user info
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const payload = response.data;

    const email = payload.email;
    const fullName = payload.name || '';
    const avatar = payload.picture?.data?.url;

    if (!email) {
      return res.status(400).json({ detail: 'Facebook account must have an email' });
    }

    const names = fullName.split(' ');
    const ten = names.pop();
    const ho = names.join(' ');

    let user = await NguoiDung.findOne({
      where: { Email: email },
      include: [{ model: VaiTro, through: { attributes: [] } }]
    });

    if (!user) {
      user = await NguoiDung.create({
        Email: email,
        Ho: ho,
        Ten: ten,
        AnhDaiDien: avatar,
        TrangThai: 'HoatDong',
        MatKhau: await bcrypt.hash(Math.random().toString(36), 10)
      });

      const vt = await VaiTro.findOne({ where: { MaVaiTro: 'patient' } });
      if (vt) {
        await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
      }

      await BenhNhan.create({
        Id_NguoiDung: user.Id_NguoiDung,
        SoDienThoaiLienHe: ''
      });

      user = await NguoiDung.findByPk(user.Id_NguoiDung, {
        include: [{ model: VaiTro, through: { attributes: [] } }]
      });
    }

    const userRole = user.VaiTros && user.VaiTros.length > 0 ? user.VaiTros[0].MaVaiTro : 'patient';
    const token = jwt.sign({ sub: user.Id_NguoiDung, role: userRole }, process.env.JWT_SECRET || 'super_secret_jwt_key_123', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.Id_NguoiDung,
        email: user.Email,
        full_name: `${user.Ho} ${user.Ten}`,
        role: userRole,
        avatar: user.AnhDaiDien
      }
    });

  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({ detail: 'Facebook authentication failed' });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.forceChangePassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password) return res.status(400).json({ detail: 'Missing new password' });

    const user = await NguoiDung.findByPk(req.user.id);
    if (!user) return res.status(404).json({ detail: 'User not found' });

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.MatKhau = hashedPassword;
    user.YeuCauDoiMatKhau = false;
    user.MatKhauHienThi = null; // Clear display password after change
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Force change password error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};


