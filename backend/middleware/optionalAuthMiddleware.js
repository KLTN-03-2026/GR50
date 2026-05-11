const jwt = require('jsonwebtoken');
const { NguoiDung, VaiTro } = require('../models');

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null' || authHeader === 'Bearer undefined') {
      req.user = null; // Guest user
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // If token is literally 'null' or 'undefined' (from frontend)
    if (token === 'null' || token === 'undefined') {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_123');

    const user = await NguoiDung.findByPk(decoded.sub, {
      include: [{ model: VaiTro, through: { attributes: [] } }]
    });

    if (!user) {
      req.user = null;
      return next();
    }

    const rolePriority = ['admin', 'doctor', 'staff', 'patient'];
    const roles = (user.VaiTros || []).map(v => v.MaVaiTro);
    const userRole = rolePriority.find(r => roles.includes(r)) || 'patient';

    let userDict = {
      id: user.Id_NguoiDung,
      email: user.Email,
      full_name: `${user.Ho} ${user.Ten}`,
      role: userRole,
      phone: user.SoDienThoai,
      Id_ChuyenKhoa_QuanLy: user.Id_ChuyenKhoa_QuanLy,
      facilities: []
    };

    req.user = userDict;
    next();
  } catch (error) {
    // If token is invalid/expired, still treat as guest instead of throwing 401
    console.error('Optional Auth error:', error.message);
    req.user = null;
    next();
  }
};

module.exports = optionalAuthMiddleware;
