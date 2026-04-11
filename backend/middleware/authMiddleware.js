const jwt = require('jsonwebtoken');
const { NguoiDung, VaiTro } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_123');

    const user = await NguoiDung.findByPk(decoded.sub, {
      include: [{ model: VaiTro, through: { attributes: [] } }]
    });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const userRole = user.VaiTros && user.VaiTros.length > 0 ? user.VaiTros[0].MaVaiTro : 'patient';

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

    req.user = userDict;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ detail: 'Invalid authentication token' });
  }
};

module.exports = authMiddleware;
