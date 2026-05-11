const { 
    PatientArchiveIndex, 
    PatientArchiveRecord, 
    BenhNhan, 
    NguoiDung, 
    DatLich,
    HoaDon,
    ThanhToan,
    CancellationReceipt,
    AIConsultationSession,
    AIConsultationResult,
    AIReconciliation
} = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

/**
 * Search patients in the archive.
 */
exports.searchArchive = async (req, res) => {
    try {
        const { query, status } = req.query;
        const facilityId = req.user.facility_id; // Using facility_id from auth context
        const isAdmin = req.user.role === 'admin';
        const isSuperAdmin = req.user.admin_type === 'SUPER_ADMIN';

        if (!isAdmin) return res.status(403).json({ detail: 'Bạn không có quyền truy cập kho lưu trữ.' });

        const where = {};
        if (!isSuperAdmin) {
            if (!facilityId) return res.status(403).json({ detail: 'Bạn không có quyền truy cập dữ liệu cơ sở.' });
            where.facilityId = facilityId;
        }
        if (query) {
            where[Op.or] = [
                { displayPatientId: { [Op.like]: `%${query}%` } },
                { fullName: { [Op.like]: `%${query}%` } },
                { phone: { [Op.like]: `%${query}%` } }
            ];
        }
        if (status) where.status = status;

        const results = await PatientArchiveIndex.findAll({
            where,
            order: [['latestVisitAt', 'DESC']],
            limit: 50
        });

        res.json(results);
    } catch (error) {
        console.error('Search archive error:', error);
        res.status(500).json({ detail: 'Lỗi khi tra cứu kho lưu trữ' });
    }
};

/**
 * Get full history for a specific patient.
 */
exports.getPatientFullArchive = async (req, res) => {
    try {
        const { patientId } = req.params;
        const facilityId = req.user.facility_id;
        const isSuperAdmin = req.user.admin_type === 'SUPER_ADMIN';

        // 1. Verify existence and permission
        const whereIndex = { patientId };
        if (!isSuperAdmin) {
            whereIndex.facilityId = facilityId;
        }

        const index = await PatientArchiveIndex.findOne({ where: whereIndex });

        if (!index) return res.status(404).json({ detail: 'Không tìm thấy hồ sơ lưu trữ cho bệnh nhân này tại cơ sở của bạn.' });

        // 2. Fetch all records from PatientArchiveRecord (Snapshots)
        const whereRecords = { patientId };
        if (!isSuperAdmin) {
            whereRecords.facilityId = facilityId;
        }

        const records = await PatientArchiveRecord.findAll({
            where: whereRecords,
            order: [['archivedAt', 'DESC']]
        });

        // 3. Fetch latest live data for context (Optional)
        const patientInfo = await BenhNhan.findByPk(patientId, {
            include: [{ model: NguoiDung, attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'SoDienThoai', 'Email', 'GioiTinh', 'NgaySinh'] }]
        });

        // 4. Fetch live AI consultation data for history
        const aiSessions = await AIConsultationSession.findAll({
            where: { patientId },
            include: [AIConsultationResult, AIReconciliation],
            order: [['createdAt', 'DESC']]
        });

        let patientInfoJson = patientInfo ? patientInfo.toJSON() : null;
        if (patientInfoJson && patientInfoJson.NguoiDung) {
            patientInfoJson.NguoiDung.HoTen = `${patientInfoJson.NguoiDung.Ho || ''} ${patientInfoJson.NguoiDung.Ten || ''}`.trim();
        }

        // Group records by type for frontend ease
        const grouped = {
            summary: index,
            patientInfo: patientInfoJson,
            appointments: records.filter(r => r.recordType === 'APPOINTMENT'),
            payments: records.filter(r => r.recordType === 'PAYMENT'),
            invoices: records.filter(r => r.recordType === 'INVOICE'),
            medicalRecords: records.filter(r => r.recordType === 'MEDICAL_RECORD'),
            cancellations: records.filter(r => r.recordType === 'CANCELLATION'),
            refunds: records.filter(r => r.recordType === 'REFUND'),
            aiData: aiSessions // Use live sessions for deep detail
        };

        res.json(grouped);
    } catch (error) {
        console.error('Get patient archive error:', error);
        res.status(500).json({ detail: 'Lỗi khi lấy chi tiết hồ sơ lưu trữ' });
    }
};

/**
 * Helper: Index/Update a patient in the archive index.
 * Usually called after an appointment is COMPLETED.
 */
exports.updateIndexOnCompletion = async (patientId, facilityId) => {
    try {
        const patient = await BenhNhan.findByPk(patientId, { include: [NguoiDung] });
        if (!patient) return;

        const [stats] = await DatLich.findAll({
            where: { Id_BenhNhan: patientId, Id_PhongKham: facilityId, TrangThai: 'COMPLETED' },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Id_DatLich')), 'count'],
                [sequelize.fn('MAX', sequelize.col('completed_time')), 'latest']
            ],
            raw: true
        });

        const totalApps = await DatLich.count({ where: { Id_BenhNhan: patientId, Id_PhongKham: facilityId } });

        await PatientArchiveIndex.upsert({
            patientId,
            facilityId,
            displayPatientId: `PAT-${patientId.toString().padStart(4, '0')}`,
            fullName: patient.NguoiDung ? `${patient.NguoiDung.Ho || ''} ${patient.NguoiDung.Ten || ''}`.trim() : null,
            phone: patient.NguoiDung?.SoDienThoai,
            totalAppointments: totalApps,
            completedAppointments: stats.count || 0,
            latestVisitAt: stats.latest,
            status: 'ACTIVE'
        });
    } catch (err) {
        console.error('Update index error:', err);
    }
};
