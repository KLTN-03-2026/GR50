const jwt = require('jsonwebtoken');
const { User, AdminPermission } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ detail: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
