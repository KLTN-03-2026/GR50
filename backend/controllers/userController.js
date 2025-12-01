const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, date_of_birth, address } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (address) updateData.address = address;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ detail: 'Không có thông tin nào để cập nhật' });
    }

    await User.update(updateData, { where: { id: userId } });
    const updatedUser = await User.findByPk(userId);

    const userDict = updatedUser.toJSON();
    delete userDict.password;

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: userDict
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

    const user = await User.findByPk(userId);
    if (!await bcrypt.compare(current_password, user.password)) {
      return res.status(400).json({ detail: 'Mật khẩu hiện tại không đúng' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.update({ password: hashedPassword }, { where: { id: userId } });

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
    // Construct full URL or relative path. Relative path is better for flexibility.
    // Assuming server runs on same domain or we handle base URL in frontend.
    // Let's store relative path.
    const avatarUrl = `/uploads/${req.file.filename}`;

    await User.update({ avatar: avatarUrl }, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId);
    const userDict = updatedUser.toJSON();
    delete userDict.password;

    res.json({
      message: 'Cập nhật ảnh đại diện thành công',
      user: userDict,
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
