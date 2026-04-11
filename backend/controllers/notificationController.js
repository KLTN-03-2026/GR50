const { ThongBao } = require('../models');

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await ThongBao.findAll({
            where: { Id_NguoiDung: userId },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ detail: 'Error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Mark specific as read or all
        if (id === 'all') {
            await ThongBao.update({ DaDoc: true }, { where: { Id_NguoiDung: userId } });
        } else {
            await ThongBao.update({ DaDoc: true }, { where: { Id_ThongBao: id, Id_NguoiDung: userId } });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ detail: 'Error updating notification' });
    }
};

exports.createMockNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        await ThongBao.create({
            Id_NguoiDung: userId,
            NoiDung: 'Bạn sắp có lịch khám vào ngày mai. Vui lòng sắp xếp thời gian đến đúng giờ!',
            Loai: 'REMINDER'
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ detail: 'Error creating notification' });
    }
};
