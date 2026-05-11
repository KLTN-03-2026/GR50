const { HoaDon, HoaDonChiTiet, DonThuoc, ChiTietDonThuoc, ThuocDanhMuc, PaymentRequest } = require('../models');
const sequelize = require('../config/database');

exports.updateMedicineChoice = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { takeMedicine } = req.body;

        const invoice = await HoaDon.findByPk(id, { transaction });
        if (!invoice) {
            await transaction.rollback();
            return res.status(404).json({ detail: 'Không tìm thấy hóa đơn' });
        }

        if (invoice.TrangThai === 'PAID') {
            await transaction.rollback();
            return res.status(400).json({ detail: 'Hóa đơn đã thanh toán, không thể thay đổi' });
        }

        // Find the prescription associated with this appointment
        const prescription = await DonThuoc.findOne({
            where: { Id_DatLich: invoice.Id_DatLich },
            include: [{
                model: ChiTietDonThuoc,
                as: 'chiTiet', // might not have alias configured, let's query separately to be safe
            }],
            transaction
        });

        let medicineTotal = 0;
        let newDetails = [];

        if (takeMedicine && prescription) {
            const items = await ChiTietDonThuoc.findAll({
                where: { Id_DonThuoc: prescription.Id_DonThuoc },
                transaction
            });

            for (const item of items) {
                const med = await ThuocDanhMuc.findByPk(item.Id_Thuoc, { transaction });
                if (med) {
                    const lineTotal = Number(item.SoLuong) * Number(med.DonGia);
                    medicineTotal += lineTotal;
                    
                    newDetails.push({
                        Id_HoaDon: invoice.Id_HoaDon,
                        LoaiDong: 'THUOC',
                        Id_ThamChieu: med.Id_Thuoc,
                        TenMuc: med.TenThuoc,
                        DonGia: med.DonGia,
                        SoLuong: item.SoLuong,
                        ThanhTien: lineTotal
                    });
                }
            }
        }

        // Update Invoice
        invoice.TongTienThuoc = takeMedicine ? medicineTotal : 0;
        invoice.TongTien = Number(invoice.TongTienKham) + Number(invoice.TongTienCanLamSang) + invoice.TongTienThuoc - Number(invoice.GiamGia);
        invoice.BenhNhanLayThuoc = takeMedicine ? 1 : 0;
        invoice.TrangThai = 'WAITING_PAYMENT';
        await invoice.save({ transaction });

        // Update Invoice Details for Medicine
        // First delete existing medicine lines
        await HoaDonChiTiet.destroy({
            where: { Id_HoaDon: invoice.Id_HoaDon, LoaiDong: 'THUOC' },
            transaction
        });

        if (takeMedicine && newDetails.length > 0) {
            await HoaDonChiTiet.bulkCreate(newDetails, { transaction });
        }

        // Update PaymentRequest amount
        const pr = await PaymentRequest.findOne({
            where: { appointmentId: invoice.Id_DatLich, status: 'PENDING' },
            transaction
        });
        if (pr) {
            pr.amount = invoice.TongTien;
            await pr.save({ transaction });
        }

        // Update Prescription status if needed
        if (prescription) {
            prescription.BenhNhanLayThuoc = takeMedicine ? 1 : 0;
            prescription.TrangThai = takeMedicine ? 'DISPENSED' : 'PATIENT_DECLINED_MEDICINE';
            await prescription.save({ transaction });
        }

        await transaction.commit();
        res.json({ message: 'Đã cập nhật lựa chọn thuốc', invoice });

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating medicine choice:', error);
        res.status(500).json({ detail: 'Lỗi khi cập nhật lựa chọn thuốc' });
    }
};
