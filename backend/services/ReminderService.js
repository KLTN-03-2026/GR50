const { ThongBao, DatLich, BenhNhan, NguoiDung } = require('../models');
const { Op } = require('sequelize');

class ReminderService {
    static async processReminders(io) {
        try {
            const now = new Date();
            const pendingReminders = await ThongBao.findAll({
                where: {
                    Status: 'PENDING',
                    ScheduledAt: {
                        [Op.lte]: now
                    },
                    Loai: 'REMINDER'
                },
                include: [
                    {
                        model: DatLich,
                        as: 'Appointment',
                        include: [
                            { model: BenhNhan, include: [NguoiDung] }
                        ]
                    }
                ]
            });

            if (pendingReminders.length === 0) return;

            console.log(`Processing ${pendingReminders.length} scheduled reminders...`);

            for (const reminder of pendingReminders) {
                try {
                    // Send via Socket.io for real-time notification
                    if (io) {
                        io.to(`user_${reminder.Id_NguoiDung}`).emit('new_notification', {
                            id: reminder.Id_ThongBao,
                            content: reminder.NoiDung,
                            type: 'REMINDER',
                            timestamp: new Date()
                        });
                    }

                    // Mark as sent
                    reminder.Status = 'SENT';
                    reminder.SentAt = new Date();
                    await reminder.save();

                    console.log(`Reminder ${reminder.Id_ThongBao} sent to user ${reminder.Id_NguoiDung}`);
                } catch (sendErr) {
                    console.error(`Failed to send reminder ${reminder.Id_ThongBao}:`, sendErr);
                    reminder.Status = 'FAILED';
                    await reminder.save();
                }
            }
        } catch (error) {
            console.error('ReminderService process error:', error);
        }
    }

    static start(io) {
        // Run every minute
        setInterval(() => {
            this.processReminders(io);
        }, 60000);
        console.log('Reminder Service started (checking every minute)');
    }
}

module.exports = ReminderService;
