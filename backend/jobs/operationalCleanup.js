const { DatLich, AppointmentQueue, PaymentTransaction, db } = require('../models');
const { Op } = require('sequelize');
const { archiveOperationalRecord } = require('../utils/archiveHelper');

/**
 * Job: Clean up unpaid bookings after 30 minutes.
 */
const expireUnpaidBookingsJob = async () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const unpaid = await DatLich.findAll({
        where: {
            TrangThai: 'PENDING_PAYMENT',
            NgayTao: { [Op.lt]: thirtyMinsAgo },
            isVisible: true
        }
    });

    for (const booking of unpaid) {
        booking.TrangThai = 'EXPIRED';
        await archiveOperationalRecord(booking, 'BOOKING', 'Unpaid for > 30 minutes');
    }
};

/**
 * Job: Clean up completed queue items after 60 minutes.
 */
const cleanupCompletedQueueItemsJob = async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const completed = await AppointmentQueue.findAll({
        where: {
            status: { [Op.in]: ['COMPLETED', 'SKIPPED', 'NO_SHOW'] },
            updatedAt: { [Op.lt]: oneHourAgo },
            isVisible: true
        }
    });

    for (const item of completed) {
        await archiveOperationalRecord(item, 'QUEUE', 'Completed/Skipped for > 60 minutes');
    }
};

/**
 * Job: Auto-cancel unconfirmed appointments at 16:40 daily.
 * Rule: Cancellation Receipt is created, penalty 20% if paid.
 */
const autoCancelExpiredAppointmentsAt1640Job = async () => {
    const { CancellationReceipt, getNextSequence } = require('../models');
    const today = new Date().toISOString().split('T')[0];
    
    const expired = await DatLich.findAll({
        where: {
            // Business logic for "today's appointments"
            // Filter by date if applicable, or logic for pending ones
            TrangThai: { 
                [Op.in]: [
                    'PENDING', 'PENDING_PAYMENT', 'PAID_WAITING_CONFIRMATION', 
                    'WAITING_STAFF_CONFIRMATION', 'WAITING_DOCTOR_CONFIRMATION'
                ] 
            },
            isVisible: true
            // In a real scenario, we'd filter for appointment_date = today
        }
    });

    for (const appt of expired) {
        // 1. Create Cancellation Receipt
        const seq = await getNextSequence(appt.Id_PhongKham, 'BOOKING');
        const penalty = appt.isFullyPaid ? (parseFloat(appt.GiaTien) * 0.2) : 0;
        const refund = appt.isFullyPaid ? (parseFloat(appt.GiaTien) * 0.8) : 0;

        await CancellationReceipt.create({
            receiptCode: `CXL-${seq.displayId}-${Date.now()}`,
            appointmentId: appt.Id_DatLich,
            patientId: appt.Id_BenhNhan,
            facilityId: appt.Id_PhongKham,
            doctorId: appt.Id_BacSi,
            reason: 'Lịch hẹn quá hạn xử lý đến 16:40 cùng ngày',
            originalFee: appt.GiaTien,
            paidAmount: appt.isFullyPaid ? appt.GiaTien : 0,
            penaltyAmount: penalty,
            refundEstimated: refund,
            cancelledBy: 'SYSTEM'
        });

        // 2. Archive and Hide
        appt.TrangThai = 'CANCELLED_BY_SYSTEM';
        appt.LyDoHuy = 'Quá hạn xử lý trong ngày (16:40 Auto-Cleanup)';
        await archiveOperationalRecord(appt, 'BOOKING', 'EXPIRED_AT_16_40');
        
        console.log(`Auto-cancelled appointment ${appt.Id_DatLich} for patient ${appt.Id_BenhNhan}`);
    }
};

module.exports = {
    expireUnpaidBookingsJob,
    cleanupCompletedQueueItemsJob,
    autoCancelExpiredAppointmentsAt1640Job
};
