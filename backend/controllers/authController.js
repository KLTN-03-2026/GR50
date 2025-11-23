const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Doctor, Patient, AdminPermission } = require('../models');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
  try {
    const { email, username, password, full_name, phone, date_of_birth, address, role, specialty_id, experience_years, consultation_fee, bio } = req.body;

    // Validation
    if (!email || !username || !password || !full_name || !phone) {
      return res.status(400).json({ detail: 'Missing required fields' });
    }

    // Check existing
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ detail: 'Email or Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      full_name,
      phone,
      date_of_birth,
      address,
      role
    });

    if (role === 'doctor' || role === 'department_head') {
      await Doctor.create({
        user_id: user.id,
        specialty_id,
        experience_years: experience_years || 0,
        consultation_fee: consultation_fee || 0,
        bio,
        status: 'pending'
      });
    } else if (role === 'patient') {
      await Patient.create({
        user_id: user.id
      });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userDict = user.toJSON();
    delete userDict.password;

    res.json({
      token,
      user: userDict
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log(`Login attempt for: ${login}`);

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: login }, { username: login }]
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ detail: 'Email/Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!' });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userDict = user.toJSON();
    delete userDict.password;

    if (user.role === 'admin') {
      const permission = await AdminPermission.findOne({ where: { user_id: user.id } });
      if (permission) {
        userDict.admin_permissions = permission.toJSON();
        delete userDict.admin_permissions.user_id;
        delete userDict.admin_permissions.id;
      }
    }

    res.json({
      token,
      user: userDict
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
