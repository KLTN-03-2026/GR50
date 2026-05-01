const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NguoiDung, VaiTro, NguoiDung_VaiTro, BacSi, BenhNhan, AuthToken, PhongKham, StaffProfile, AdminProfile } = require('../models');

const { Op } = require('sequelize');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateOtp = require('../utils/generateOtp');
const { sendOtpToEmail, sendOtpToPhone } = require('../utils/sendOtp');

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

    const vaiTroMap = { 'patient': 'patient', 'doctor': 'doctor', 'admin': 'admin', 'staff': 'staff' };
    const vt = await VaiTro.findOne({ where: { MaVaiTro: vaiTroMap[role] || 'patient' } });

    if (vt) {
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
    }

    if (role === 'doctor' || role === 'staff') {
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

    const rolePriority = ['admin', 'doctor', 'staff', 'patient'];
    const roles = (user.VaiTros || []).map(v => v.MaVaiTro);
    const userRole = rolePriority.find(r => roles.includes(r)) || 'patient';
    const token = jwt.sign({ sub: user.Id_NguoiDung, role: userRole }, process.env.JWT_SECRET || 'super_secret_jwt_key_123', { expiresIn: '7d' });

    let userFacilities = [];
    if (userRole === 'doctor') {
      const bs = await BacSi.findOne({ 
        where: { Id_NguoiDung: user.Id_NguoiDung }, 
        include: [{ model: PhongKham, as: 'facilities' }] 
      });
      if (bs && bs.facilities) {
        userFacilities = bs.facilities.map(pk => ({ id: pk.Id_PhongKham, name: pk.TenPhongKham }));
      }

    } else if (userRole === 'staff') {
      const staff = await StaffProfile.findOne({ 
        where: { user_id: user.Id_NguoiDung }, 
        include: [{ model: PhongKham, as: 'facilities' }] 
      });
      if (staff && staff.facilities) {
        userFacilities = staff.facilities.map(pk => ({ id: pk.Id_PhongKham, name: pk.TenPhongKham }));
      }
    }

    let userDict = {
      id: user.Id_NguoiDung,
      email: user.Email,
      full_name: `${user.Ho} ${user.Ten}`,
      role: userRole,
      phone: user.SoDienThoai,
      must_change_password: user.YeuCauDoiMatKhau,
      facilities: userFacilities
    };

    if (userRole === 'admin') {
      const ap = await AdminProfile.findOne({ 
        where: { user_id: user.Id_NguoiDung },
        include: [{ model: PhongKham, as: 'assignedFacility' }]
      });
      
      if (ap) {
        userDict.admin_type = ap.admin_type;
        userDict.admin_permissions = {
          can_manage_doctors: ap.can_manage_doctors,
          can_manage_staff: ap.can_manage_staff,
          can_manage_patients: ap.can_manage_patients,
          can_view_stats: ap.can_view_stats,
          can_manage_payments: ap.can_manage_payments,
          can_manage_specialties: ap.can_manage_specialties,
          can_create_admins: ap.can_manage_admins
        };
        if (ap.admin_type === 'FACILITY_ADMIN' && ap.assignedFacility) {
          userDict.facilities = [{ id: ap.assignedFacility.Id_PhongKham, name: ap.assignedFacility.TenPhongKham }];
        }
      } else {
        // Legacy fallback
        userDict.admin_type = 'SUPER_ADMIN';
        userDict.admin_permissions = {
          can_manage_doctors: true,
          can_manage_patients: true,
          can_view_stats: true,
          can_manage_specialties: true,
          can_create_admins: true
        };
      }
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

    const rolePriority = ['admin', 'doctor', 'staff', 'patient'];
    const roles = (user.VaiTros || []).map(v => v.MaVaiTro);
    const userRole = rolePriority.find(r => roles.includes(r)) || 'patient';
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

    const rolePriority = ['admin', 'doctor', 'staff', 'patient'];
    const roles = (user.VaiTros || []).map(v => v.MaVaiTro);
    const userRole = rolePriority.find(r => roles.includes(r)) || 'patient';
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
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Force change password error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { contact } = req.body;
    if (!contact) {
      return res.status(400).json({ message: "Vui lòng nhập email hoặc số điện thoại" });
    }

    const user = await NguoiDung.findOne({
      where: {
        [Op.or]: [
          { Email: contact },
          { SoDienThoai: contact }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    // Invalidate old tokens
    await AuthToken.update(
      { IsUsed: true },
      { where: { Id_NguoiDung: user.Id_NguoiDung, IsUsed: false, Type: 'PASSWORD_RESET_OTP' } }
    );

    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await AuthToken.create({
      Id_NguoiDung: user.Id_NguoiDung,
      Type: 'PASSWORD_RESET_OTP',
      Token: otp,
      Contact: contact,
      ExpiresAt: expiresAt,
      IsUsed: false,
      AttemptCount: 0
    });

    if (contact.includes("@")) {
      await sendOtpToEmail(contact, otp);
    } else {
      await sendOtpToPhone(contact, otp);
    }

    return res.json({ message: "Mã xác minh đã được gửi" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ detail: "Lỗi server" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { contact, otp } = req.body;
    if (!contact || !otp) {
      return res.status(400).json({ message: "Thiếu thông tin xác minh" });
    }

    const tokenRecord = await AuthToken.findOne({
      where: { Contact: contact, IsUsed: false, Type: 'PASSWORD_RESET_OTP' },
      order: [['createdAt', 'DESC']]
    });

    if (!tokenRecord) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã qua sử dụng" });
    }

    if (tokenRecord.AttemptCount >= 5) {
      tokenRecord.IsUsed = true;
      await tokenRecord.save();
      return res.status(400).json({ message: "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã." });
    }

    if (new Date(tokenRecord.ExpiresAt) < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    if (tokenRecord.Token !== String(otp)) {
      tokenRecord.AttemptCount += 1;
      await tokenRecord.save();
      return res.status(400).json({ message: "Mã OTP không đúng" });
    }

    return res.json({
      message: "Xác minh OTP thành công",
      resetId: tokenRecord.id,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ detail: "Lỗi server" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetId, newPassword, confirmPassword } = req.body;

    if (!resetId || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const tokenRecord = await AuthToken.findOne({
      where: { id: resetId, IsUsed: false, Type: 'PASSWORD_RESET_OTP' }
    });

    if (!tokenRecord) {
      return res.status(400).json({ message: "Yêu cầu không hợp lệ hoặc đã sử dụng" });
    }

    if (new Date(tokenRecord.ExpiresAt) < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    const user = await NguoiDung.findByPk(tokenRecord.Id_NguoiDung);
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.MatKhau = hashedPassword;
    user.YeuCauDoiMatKhau = false;
    await user.save();

    tokenRecord.IsUsed = true;
    await tokenRecord.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ detail: "Lỗi server" });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }

    const userId = req.user.id;
    const user = await NguoiDung.findByPk(userId);
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    user.AnhDaiDien = avatarPath;
    await user.save();

    res.json({ 
      message: 'Avatar updated successfully', 
      avatar_url: avatarPath 
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
