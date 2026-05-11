const { 
    PaymentRequest, 
    PaymentTransaction, 
    HoaDon, 
    DatLich, 
    BenhNhan, 
    NguoiDung, 
    PhongKham,
    LichKham,
    BacSi,
    sequelize 
} = require('../models');
const { Op } = require('sequelize');

/**
 * Bắt đầu yêu cầu thanh toán (Patient side)
 */
exports.createPaymentRequest = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { appointmentId } = req.params;
        const { paymentMethod, policyAccepted } = req.body;

        const appointment = await DatLich.findByPk(appointmentId, {
            include: [{ model: PhongKham, as: 'Clinic' }]
        });

        if (!appointment) {
            return res.status(404).json({ detail: 'Không tìm thấy lịch hẹn.' });
        }

        // 1. Tính toán số tiền (Lấy từ phí khám của bác sĩ hoặc cấu hình phòng khám)
        const amount = appointment.TongTien || 500000; // Mặc định nếu chưa có

        // 2. Tạo PaymentRequest
        const expiredAt = new Date();
        expiredAt.setMinutes(expiredAt.getMinutes() + 15); // QR hết hạn sau 15p

        const paymentRequest = await PaymentRequest.create({
            appointmentId: appointment.Id_DatLich,
            patientId: appointment.Id_BenhNhan,
            facilityId: appointment.Id_PhongKham,
            amount: amount,
            paymentMethod: paymentMethod,
            status: 'WAITING_PAYMENT',
            expiredAt: expiredAt,
            policyAccepted: policyAccepted,
            policyVersion: 'PAYMENT_POLICY_V2'
        }, { transaction });

        // 3. Xử lý theo từng phương thức
        let responseData = {
            paymentId: paymentRequest.id,
            appointmentId: appointment.Id_DatLich,
            amount: amount,
            status: 'WAITING_PAYMENT',
            expiredAt: expiredAt
        };

        if (paymentMethod === 'BANK_QR') {
            // Giả lập tạo QR động
            responseData.bankName = "Vietcombank";
            responseData.bankAccountNumber = "1012345678";
            responseData.bankAccountName = appointment.Clinic?.TenPhongKham || "MEDISCHED SYSTEM";
            responseData.transferContent = `MED APT${appointment.Id_DatLich} PAT${appointment.Id_BenhNhan}`;
            responseData.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bank_vcb_acc_${responseData.bankAccountNumber}_amt_${amount}_msg_${responseData.transferContent}`;
        } else if (paymentMethod === 'VNPAY' || paymentMethod === 'GATEWAY') {
            responseData.paymentUrl = `https://sandbox.vnpay.vn/paymentv2/vpcpay.html?orderId=${paymentRequest.id}&amount=${amount}`;
        }

        await transaction.commit();
        res.json(responseData);
    } catch (error) {
        await transaction.rollback();
        console.error('Create payment request error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

/**
 * Webhook nhận thông báo thanh toán (Simulated)
 */
exports.handlePaymentWebhook = async (req, res) => {
    const { provider } = req.params;
    const payload = req.body;

    // Trong thực tế sẽ verify signature ở đây
    
    const transaction = await sequelize.transaction();
    try {
        // Giả sử payload có orderId (paymentRequestId) và status
        const { orderId, transactionId, amount, content, status } = payload;

        const pr = await PaymentRequest.findByPk(orderId);
        if (!pr) return res.status(404).json({ detail: 'Request not found' });

        if (pr.status === 'PAID') {
            return res.status(200).json({ detail: 'Already processed' });
        }

        // Tạo Transaction record
        const pt = await PaymentTransaction.create({
            paymentRequestId: pr.id,
            appointmentId: pr.appointmentId,
            facilityId: pr.facilityId,
            provider: provider.toUpperCase(),
            amount: pr.amount,
            paidAmount: amount,
            status: (parseFloat(amount) === parseFloat(pr.amount)) ? 'SUCCESS' : 'MISMATCH_AMOUNT',
            transactionCode: transactionId,
            transferContent: content,
            moneyReceived: true,
            paidAt: new Date(),
            rawPayload: payload
        }, { transaction });

        if (pt.status === 'SUCCESS') {
            await finalizePayment(pr, pt, transaction);
        } else {
            pr.status = pt.status;
            await pr.save({ transaction });
        }

        await transaction.commit();
        res.json({ status: 'OK' });
    } catch (error) {
        await transaction.rollback();
        console.error('Webhook error:', error);
        res.status(500).json({ detail: 'Error processing webhook' });
    }
};

/**
 * Thanh toán tại quầy (Staff side)
 */
exports.confirmCounterPayment = async (req, res) => {
    const { appointmentId } = req.params;
    const { amountReceived, note } = req.body;
    const staffId = req.user.id;

    const transaction = await sequelize.transaction();
    try {
        const appointment = await DatLich.findByPk(appointmentId);
        if (!appointment) return res.status(404).json({ detail: 'Appointment not found' });

        const pr = await PaymentRequest.create({
            appointmentId: appointment.Id_DatLich,
            patientId: appointment.Id_BenhNhan,
            facilityId: appointment.Id_PhongKham,
            amount: appointment.TongTien || amountReceived,
            paymentMethod: 'COUNTER',
            status: 'PAID',
            policyAccepted: true
        }, { transaction });

        const pt = await PaymentTransaction.create({
            paymentRequestId: pr.id,
            appointmentId: pr.appointmentId,
            facilityId: pr.facilityId,
            provider: 'CASH',
            amount: pr.amount,
            paidAmount: amountReceived,
            status: 'SUCCESS',
            transactionCode: `CASH-${Date.now()}`,
            moneyReceived: true,
            paidAt: new Date(),
            rawPayload: { note, staffId }
        }, { transaction });

        await finalizePayment(pr, pt, transaction);

        await transaction.commit();
        res.json({ detail: 'Xác nhận thanh toán tại quầy thành công.', invoiceCreated: true });
    } catch (error) {
        await transaction.rollback();
        console.error('Counter payment error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

/**
 * Helper: Chốt thanh toán, cập nhật lịch hẹn và tạo hóa đơn
 */
async function finalizePayment(paymentRequest, paymentTransaction, dbTransaction) {
    // 1. Cập nhật trạng thái PaymentRequest
    paymentRequest.status = 'PAID';
    await paymentRequest.save({ transaction: dbTransaction });

    // 2. Cập nhật trạng thái Lịch hẹn
    const appointment = await DatLich.findByPk(paymentRequest.appointmentId);
    appointment.TrangThai = 'CONFIRMED'; // Đã xác nhận
    await appointment.save({ transaction: dbTransaction });

    // 3. Tạo hóa đơn chính thức
    await HoaDon.create({
        Id_DatLich: appointment.Id_DatLich,
        Id_PhongKham: appointment.Id_PhongKham,
        patientId: appointment.Id_BenhNhan,
        paymentId: paymentRequest.id,
        TongTien: paymentTransaction.paidAmount,
        PhiKham: paymentTransaction.paidAmount,
        TrangThai: 'PAID',
        GhiChu: `Thanh toán tự động qua ${paymentTransaction.provider}. Mã GD: ${paymentTransaction.transactionCode}`
    }, { transaction: dbTransaction });
}

/**
 * Lấy lịch sử thanh toán
 */
exports.getMyPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        let bn = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
        if (!bn) {
            bn = await BenhNhan.create({ Id_NguoiDung: userId });
        }
        if (!bn) return res.json([]);

        const requests = await PaymentRequest.findAll({
            where: { patientId: bn.Id_BenhNhan },
            order: [['createdAt', 'DESC']],
            include: [
                { model: DatLich, as: 'appointment', include: [{ model: PhongKham, as: 'Clinic' }] },
                { model: PaymentTransaction, as: 'transactions' }
            ]
        });

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const pr = await PaymentRequest.findByPk(id, {
            include: [
                { model: DatLich, as: 'appointment' },
                { model: PaymentTransaction, as: 'transactions' }
            ]
        });
        if (!pr) return res.status(404).json({ detail: 'Not found' });
        res.json(pr);
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};
