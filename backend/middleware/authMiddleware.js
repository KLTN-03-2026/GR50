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

    if (userRole === 'doctor') {
      const { BacSi, PhongKham } = require('../models');
      const bs = await BacSi.findOne({ 
        where: { Id_NguoiDung: user.Id_NguoiDung }, 
        include: [{ model: PhongKham, as: 'facilities' }] 
      });
      if (bs && bs.facilities) {
        userDict.facilities = bs.facilities.map(pk => ({ id: pk.Id_PhongKham, name: pk.TenPhongKham }));
      }

    } else if (userRole === 'staff') {
      const { StaffProfile, PhongKham } = require('../models');
      const staff = await StaffProfile.findOne({ 
        where: { user_id: user.Id_NguoiDung }, 
        include: [{ model: PhongKham, as: 'facilities' }] 
      });
      if (staff && staff.facilities) {
        userDict.facilities = staff.facilities.map(pk => ({ id: pk.Id_PhongKham, name: pk.TenPhongKham }));
      }
    }

    if (userRole === 'admin') {
      const { AdminProfile, PhongKham } = require('../models');
      const ap = await AdminProfile.findOne({ 
        where: { user_id: user.Id_NguoiDung },
        include: [{ model: PhongKham, as: 'assignedFacility' }]
      });

      if (ap) {
        userDict.admin_type = ap.admin_type;
        userDict.facility_id = ap.facility_id;
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

    req.user = userDict;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ detail: 'Invalid authentication token' });
  }
};

module.exports = authMiddleware;
