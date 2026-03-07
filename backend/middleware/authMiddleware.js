const jwt = require('jsonwebtoken');
const { User, AdminPermission } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_123');

    // HARDCODED USERS CHECK FIRST
    if (decoded.sub === 1 || decoded.sub === '1') {
      req.user = {
        id: 1,
        email: 'admin@medischedule.com',
        username: 'admin',
        full_name: 'Quản Trị Viên',
        role: 'admin',
        phone: '0901234567',
        address: 'Hà Nội, Việt Nam',
        admin_permissions: {
          can_manage_doctors: true,
          can_manage_patients: true,
          can_manage_appointments: true,
          can_view_stats: true,
          can_manage_specialties: true,
          can_create_admins: true
        }
      };
      return next();
    } else if (decoded.sub === 2 || decoded.sub === '2') {
      req.user = {
        id: 2,
        email: 'doctor1@test.com',
        username: 'doctor1',
        full_name: 'BS. Nguyễn Văn A',
        role: 'doctor',
        phone: '0912345678',
        address: 'Hồ Chí Minh',
      };
      return next();
    }

    // Fallback to DB
    const user = await User.findByPk(decoded.sub);
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

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

    req.user = userDict;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ detail: 'Invalid authentication token' });
  }
};

module.exports = authMiddleware;
