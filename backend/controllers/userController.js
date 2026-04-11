const { NguoiDung } = require('../models');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, date_of_birth, address } = req.body;
    const userId = req.user.id; // comes from req.user mapping id

    const updateData = {};
    if (full_name) {
      const parts = full_name.split(' ');
      updateData.Ten = parts.pop();
      updateData.Ho = parts.join(' ');
    }
    if (phone) updateData.SoDienThoai = phone;
    if (date_of_birth) updateData.NgaySinh = date_of_birth;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ detail: 'Không có thông tin nào để cập nhật' });
    }

    await NguoiDung.update(updateData, { where: { Id_NguoiDung: userId } });

    // Refresh user context dict matching expected payload
    const updatedUser = await NguoiDung.findByPk(userId);

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser.Id_NguoiDung,
        email: updatedUser.Email,
        full_name: `${updatedUser.Ho} ${updatedUser.Ten}`,
        phone: updatedUser.SoDienThoai,
        avatar: updatedUser.AnhDaiDien
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    const user = await NguoiDung.findByPk(userId);
    if (!await bcrypt.compare(current_password, user.MatKhau)) {
      return res.status(400).json({ detail: 'Mật khẩu hiện tại không đúng' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await NguoiDung.update({ MatKhau: hashedPassword }, { where: { Id_NguoiDung: userId } });

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'Vui lòng chọn ảnh' });
    }

    const userId = req.user.id;
    const avatarUrl = `/uploads/${req.file.filename}`;

    await NguoiDung.update({ AnhDaiDien: avatarUrl }, { where: { Id_NguoiDung: userId } });

    const updatedUser = await NguoiDung.findByPk(userId);

    res.json({
      message: 'Cập nhật ảnh đại diện thành công',
      user: {
        id: updatedUser.Id_NguoiDung,
        email: updatedUser.Email,
        full_name: `${updatedUser.Ho} ${updatedUser.Ten}`,
        phone: updatedUser.SoDienThoai,
        avatar: avatarUrl
      },
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
