const { sequelize, NguoiDung, BacSi, BenhNhan, VaiTro, DatLich, LichKham, ChuyenKhoa, NguoiDung_VaiTro, PhongKham, HoaDon } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Staff Controller - Operational Business Logic
 * Focused on front-line operations, coordination, and patient support.
 */

// --- Helpers ---
const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const generateEmail = (fullName) => {
    if (!fullName) return `user.${Date.now()}@gmail.com`;
    const cleanName = removeAccents(fullName.toLowerCase().trim());
    const parts = cleanName.split(/\s+/);
    return `${parts.join('.')}@gmail.com`;
};

const generatePassword = () => {
    return Math.random().toString(36).slice(-8); 
};

const getStaffFacilities = async (userId, requestedFacilityId = null) => {
    const { NguoiDung_PhongKham } = require('../models');
    if (!NguoiDung_PhongKham) return [];
    const links = await NguoiDung_PhongKham.findAll({ where: { staff_id: userId, is_active: true } });
    let allowedIds = links.map(l => l.facility_id);
    if (requestedFacilityId) {
        return allowedIds.includes(parseInt(requestedFacilityId)) ? [parseInt(requestedFacilityId)] : [];
    }
    return allowedIds;
};

// --- Operations ---

/**
 * STAFF-01: Operational Dashboard
 * Stats for today's operations
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const { facility_id } = req.query;
        const today = new Date().toISOString().split('T')[0];
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        const facilityFilter = facilityIds.length > 0 ? { Id_PhongKham: { [Op.in]: facilityIds } } : {};
        
        const appointmentsToday = await DatLich.count({
            where: facilityFilter,
            include: [{
                model: LichKham,
                where: { NgayDate: today }
            }]
        });

        const waitingPatients = await DatLich.count({
            where: { TrangThai: 'CHECKED_IN', ...facilityFilter }
        });

        // For doctors, we need to count doctors who are active and linked to these facilities
        const { BacSi_PhongKham } = require('../models');
        const activeDoctors = await BacSi.count({
            where: { TrangThai: 'HoatDong' },
            include: [{
                model: PhongKham,
                where: facilityIds.length > 0 ? { Id_PhongKham: { [Op.in]: facilityIds } } : {},
                required: facilityIds.length > 0
            }]
        });

        const pendingConfirmations = await DatLich.count({
            where: { TrangThai: { [Op.in]: ['ChoXacNhan', 'PENDING'] }, ...facilityFilter }
        });

        const onlineAppointments = await DatLich.count({
            where: facilityFilter,
            include: [{
                model: LichKham,
                where: { LoaiKham: 'Online', NgayDate: today }
            }]
        });

        const unpaidInvoices = await HoaDon.count({
            where: { TrangThai: 'ISSUED', ...facilityFilter }
        });

        // Get 5 most recent activities (waiting or checked in)
        const recentActivity = await DatLich.findAll({
            where: { 
                TrangThai: { [Op.in]: ['CHECKED_IN', 'WAITING', 'PENDING'] },
                ...facilityFilter
            },
            include: [
                {
                    model: BenhNhan,
                    include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }]
                },
                {
                    model: LichKham,
                    include: [{ 
                        model: BacSi, 
                        include: [
                            { model: NguoiDung, attributes: ['Ho', 'Ten'] },
                            { model: ChuyenKhoa }
                        ] 
                    }]
                }
            ],
            limit: 5,
            order: [['NgayCapNhat', 'DESC']]
        });

        res.json({
            appointments_today: appointmentsToday,
            waiting_patients: waitingPatients,
            active_doctors: activeDoctors,
            pending_confirmations: pendingConfirmations,
            online_appointments: onlineAppointments,
            unpaid_invoices_count: unpaidInvoices,
            late_appointments_count: 0, // Simplified for now
            recent_activity: recentActivity.map(a => ({
                id: a.Id_DatLich,
                patient_name: `${a.BenhNhan?.NguoiDung?.Ho || ''} ${a.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
                doctor_name: `${a.LichKham?.BacSi?.NguoiDung?.Ho || ''} ${a.LichKham?.BacSi?.NguoiDung?.Ten || ''}`.trim(),
                status: a.TrangThai,
                time: a.LichKham?.KhungGio,
                specialty: a.LichKham?.BacSi?.ChuyenKhoa?.TenChuyenKhoa || 'General'
            })),
            system_status: 'Optimal'
        });
    } catch (error) {
        console.error('StaffDashboardStats Error Details:', error);
        res.status(500).json({ detail: 'Error fetching dashboard stats', error: error.message });
    }
};

/**
 * STAFF-02: Patient Reception & Lookup
 */
exports.searchPatients = async (req, res) => {
    try {
        const { query } = req.query;
        const patients = await BenhNhan.findAll({
            include: [{
                model: NguoiDung,
                where: query ? {
                    [Op.or]: [
                        { Ho: { [Op.like]: `%${query}%` } },
                        { Ten: { [Op.like]: `%${query}%` } },
                        { Email: { [Op.like]: `%${query}%` } },
                        { SoDienThoai: { [Op.like]: `%${query}%` } }
                    ]
                } : {}
            }]
        });

        const result = patients.map(p => ({
            id: p.Id_BenhNhan,
            user_id: p.Id_NguoiDung,
            full_name: `${p.NguoiDung?.Ho || ''} ${p.NguoiDung?.Ten || ''}`.trim(),
            email: p.NguoiDung?.Email,
            phone: p.NguoiDung?.SoDienThoai,
            dob: p.NguoiDung?.NgaySinh,
            gender: p.NguoiDung?.GioiTinh
        }));

        res.json(result);
    } catch (error) {
        console.error('StaffSearchPatients Error:', error);
        res.status(500).json({ detail: 'Error searching patients' });
    }
};

exports.createPatientAccount = async (req, res) => {
    try {
        const { full_name, email, phone, gender, dob } = req.body;
        
        const finalEmail = email || generateEmail(full_name);
        const existingUser = await NguoiDung.findOne({ where: { Email: finalEmail } });
        if (existingUser) return res.status(400).json({ detail: 'Email already exists' });

        const tempPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');

        const user = await NguoiDung.create({
            Ho: ho,
            Ten: ten,
            Email: finalEmail,
            MatKhau: hashedPassword,
            SoDienThoai: phone,
            GioiTinh: gender,
            NgaySinh: dob,
            TrangThai: 'HoatDong',
            YeuCauDoiMatKhau: true
        });

        const patientRole = await VaiTro.findOne({ where: { MaVaiTro: 'patient' } });
        await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: patientRole.Id_VaiTro });
        
        const patient = await BenhNhan.create({ Id_NguoiDung: user.Id_NguoiDung, SoDienThoaiLienHe: phone });

        res.status(201).json({
            message: 'Patient account created',
            id: patient.Id_BenhNhan,
            temp_password: tempPassword,
            email: finalEmail
        });
    } catch (error) {
        console.error('StaffCreatePatient Error:', error);
        res.status(500).json({ detail: 'Error creating patient account' });
    }
};

/**
 * STAFF-03 & STAFF-04: Booking Assist & Coordination
 */
exports.getAppointments = async (req, res) => {
    try {
        const { status, date, facility_id } = req.query;
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        const whereClause = {};
        
        if (facilityIds.length > 0) whereClause.Id_PhongKham = { [Op.in]: facilityIds };
        if (status) whereClause.TrangThai = status;
        
        // Simplified date filtering
        // In a real app we'd use something more robust for dates
        
        const appointments = await DatLich.findAll({
            where: whereClause,
            include: [
                {
                    model: BenhNhan,
                    include: [{ model: NguoiDung, attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai'] }]
                },
                {
                    model: LichKham,
                    include: [{
                        model: BacSi,
                        include: [
                            { model: NguoiDung, attributes: ['Ho', 'Ten'] },
                            { model: ChuyenKhoa }
                        ]
                    }]
                }
            ],
            order: [['NgayTao', 'DESC']]
        });

        const result = appointments.map(a => ({
            id: a.Id_DatLich,
            patient_name: `${a.BenhNhan?.NguoiDung?.Ho || ''} ${a.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
            doctor_name: `${a.LichKham?.BacSi?.NguoiDung?.Ho || ''} ${a.LichKham?.BacSi?.NguoiDung?.Ten || ''}`.trim(),
            specialty: a.LichKham?.BacSi?.ChuyenKhoa?.TenChuyenKhoa,
            status: a.TrangThai,
            time: a.LichKham?.KhungGio,
            date: a.NgayHen || a.ThoiDiemDat,
            fee: a.GiaTien
        }));

        res.json(result);
    } catch (error) {
        console.error('StaffGetAppointments Error:', error);
        res.status(500).json({ detail: 'Error fetching appointments' });
    }
};

/**
 * STAFF-05: Check-in & Status Management
 */
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // CHECKED_IN, WAITING, etc.

        const appointment = await DatLich.findByPk(id);
        if (!appointment) return res.status(404).json({ detail: 'Appointment not found' });

        await appointment.update({ TrangThai: status });
        res.json({ message: `Status updated to ${status}`, status });
    } catch (error) {
        console.error('StaffUpdateStatus Error:', error);
        res.status(500).json({ detail: 'Error updating appointment status' });
    }
};

/**
 * STAFF-09: Payment Support
 */
exports.getInvoices = async (req, res) => {
    try {
        const { facility_id } = req.query;
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        const facilityFilter = facilityIds.length > 0 ? { Id_PhongKham: { [Op.in]: facilityIds } } : {};
        
        const invoices = await HoaDon.findAll({
            where: facilityFilter,
            include: [
                {
                    model: DatLich,
                    include: [{
                        model: BenhNhan,
                        include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }]
                    }]
                }
            ],
            order: [['NgayTao', 'DESC']]
        });

        const result = invoices.map(i => ({
            id: i.Id_HoaDon,
            appointment_id: i.Id_DatLich,
            patient_name: `${i.DatLich?.BenhNhan?.NguoiDung?.Ho || ''} ${i.DatLich?.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
            amount: i.TongTien,
            status: i.TrangThai,
            date: i.NgayTao,
            fees: {
                phiKham: i.PhiKham,
                phiDichVu: i.PhiDichVu,
                phiThuoc: i.PhiThuoc,
                giamGia: i.GiamGia
            },
            note: i.GhiChu
        }));

        res.json(result);
    } catch (error) {
        console.error('StaffGetInvoices Error:', error);
        res.status(500).json({ detail: 'Error fetching invoices' });
    }
};

/**
 * STAFF-09-B: Process Payment
 */
exports.payInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body; // 'cash' or 'transfer'

        const invoice = await HoaDon.findByPk(id);
        if (!invoice) return res.status(404).json({ detail: 'Invoice not found' });

        if (invoice.TrangThai === 'PAID') {
            return res.status(400).json({ detail: 'Hóa đơn đã được thanh toán' });
        }

        const currentNote = invoice.GhiChu || '';
        const paymentNote = `\nĐã thanh toán bằng: ${paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}`;

        await invoice.update({
            TrangThai: 'PAID',
            GhiChu: currentNote + paymentNote
        });

        // Also update appointment status if needed
        const DatLich = require('../models/DatLich');
        const appointment = await DatLich.findByPk(invoice.Id_DatLich);
        if (appointment) {
             // Let it be COMPLETED
        }

        res.json({ message: 'Thanh toán thành công', invoice });
    } catch (error) {
        console.error('StaffPayInvoice Error:', error);
        res.status(500).json({ detail: 'Error processing payment' });
    }
};

/**
 * STAFF-10: Update Patient Info
 */
exports.updatePatientInfo = async (req, res) => {
    try {
        const { id } = req.params; // BenhNhan ID
        const { phone, address } = req.body;

        const patient = await BenhNhan.findByPk(id);
        if (!patient) return res.status(404).json({ detail: 'Patient not found' });

        await patient.update({ SoDienThoaiLienHe: phone, DiaChi: address });
        res.json({ message: 'Patient info updated' });
    } catch (error) {
        console.error('StaffUpdatePatient Error:', error);
        res.status(500).json({ detail: 'Error updating patient info' });
    }
};
/**
 * STAFF-11: Doctors List for Coordination
 */
exports.getDoctorsForCoordination = async (req, res) => {
    try {
        const { facility_id } = req.query;
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        const facilityFilter = facilityIds.length > 0 ? { Id_PhongKham: { [Op.in]: facilityIds } } : {};

        const doctors = await BacSi.findAll({
            where: { TrangThai: 'HoatDong' },
            include: [
                { model: NguoiDung, attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai'] },
                { model: ChuyenKhoa },
                { 
                    model: PhongKham, 
                    where: facilityFilter,
                    required: facilityIds.length > 0
                }
            ]
        });

        const result = doctors.map(d => ({
            id: d.Id_BacSi,
            full_name: `${d.NguoiDung?.Ho || ''} ${d.NguoiDung?.Ten || ''}`.trim(),
            specialty: d.ChuyenKhoa?.TenChuyenKhoa,
            clinic: d.PhongKham?.TenPhongKham || d.NoiLamViec,
            experience: d.SoNamKinhNghiem,
            fee: d.PhiTuVan,
            status: 'Online', // Simplified
            current_load: 0 // In a real app, calculate appointments for today
        }));

        res.json(result);
    } catch (error) {
        console.error('StaffGetDoctorsCoord Error:', error);
        res.status(500).json({ detail: 'Error fetching doctors' });
    }
};

/**
 * STAFF-08: AI Triage Queue for Coordination
 */
exports.getTriageQueue = async (req, res) => {
    try {
        const { facility_id } = req.query;
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        const facilityFilter = facilityIds.length > 0 ? { Id_PhongKham: { [Op.in]: facilityIds } } : {};

        const { AITuVanPhien } = require('../models');
        const triageItems = await AITuVanPhien.findAll({
            where: {
                TrangThaiChuyenGiao: 'pending',
                ...facilityFilter
            },
            include: [{ model: NguoiDung, as: 'nguoiDung', attributes: ['Ho', 'Ten'] }],
            order: [['NgayCapNhat', 'DESC']]
        });

        const result = triageItems.map(t => ({
            id: t.Id_AITuVanPhien,
            patient_name: `${t.nguoiDung?.Ho || ''} ${t.nguoiDung?.Ten || ''}`.trim(),
            summary: t.TrieuChungTomTat || t.TieuDe || 'Chưa có thông tin',
            diagnosis: t.ChuanDoanSoBo || 'Chưa có chẩn đoán',
            suggested_specialty: t.GoiYChuyenKhoa || 'Nội tổng hợp',
            priority: t.MucDoUuTien,
            time: t.NgayCapNhat
        }));

        res.json(result);
    } catch (error) {
        console.error('StaffGetTriage Error:', error);
        res.status(500).json({ detail: 'Error fetching triage queue' });
    }
};

/**
 * STAFF-12: Assign Doctor to Triage Session
 */
exports.assignDoctorToTriage = async (req, res) => {
    try {
        const { triageId, doctorId } = req.body;
        const { AITuVanPhien } = require('../models');

        const session = await AITuVanPhien.findByPk(triageId);
        if (!session) return res.status(404).json({ detail: 'Triage session not found' });

        await session.update({
            Id_BacSi_PhuTrach: doctorId,
            TrangThaiChuyenGiao: 'assigned'
        });

        res.json({ message: 'Doctor assigned successfully', triageId, doctorId });
    } catch (error) {
        console.error('StaffAssignDoctor Error:', error);
        res.status(500).json({ detail: 'Error assigning doctor' });
    }
};

/**
 * STAFF-06: Video Support / Meeting Info
 */
exports.getVideoMeetingStatus = async (req, res) => {
    try {
        const { id } = req.params; // Appointment ID
        const appointment = await DatLich.findByPk(id, {
            include: [{ model: LichKham, where: { LoaiKham: 'Online' } }]
        });

        if (!appointment) return res.status(404).json({ detail: 'Online appointment not found' });

        res.json({
            id: appointment.Id_DatLich,
            meeting_url: `https://medischedule.com/video/${appointment.Id_DatLich}`,
            status: appointment.TrangThai === 'IN_PROGRESS' ? 'Active' : 'Scheduled',
            participants_ready: true // Mocked
        });
    } catch (error) {
        console.error('StaffVideoSupport Error:', error);
        res.status(500).json({ detail: 'Error fetching video status' });
    }
};
/**
 * STAFF-13: Get Patient by ID
 */
exports.getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await BenhNhan.findByPk(id, {
            include: [{ model: NguoiDung, attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai'] }]
        });
        if (!patient) return res.status(404).json({ detail: 'Patient not found' });

        res.json({
            id: patient.Id_BenhNhan,
            full_name: `${patient.NguoiDung?.Ho || ''} ${patient.NguoiDung?.Ten || ''}`.trim(),
            email: patient.NguoiDung?.Email,
            phone: patient.NguoiDung?.SoDienThoai
        });
    } catch (error) {
        console.error('StaffGetPatientById Error:', error);
        res.status(500).json({ detail: 'Error fetching patient info' });
    }
};

/**
 * STAFF-14: Create Appointment (Booking Assist)
 */
exports.createAppointment = async (req, res) => {
    try {
        const { patientId, slotId, note } = req.body;
        
        // Generate booking code
        const maDatLich = `DL${Date.now().toString().slice(-6)}`;

        const appointment = await DatLich.create({
            MaDatLich: maDatLich,
            Id_BenhNhan: patientId,
            Id_LichKham: slotId,
            TrangThai: 'DaXacNhan', // Staff bookings are auto-confirmed
            GhiChu: note,
            ThoiDiemDat: new Date()
        });

        res.json({ message: 'Appointment created successfully', id: appointment.Id_DatLich, code: maDatLich });
    } catch (error) {
        console.error('StaffCreateAppointment Error:', error);
        res.status(500).json({ detail: 'Error creating appointment' });
    }
};

/**
 * STAFF-15: Monitor Online Consultations
 */
exports.getOnlineConsultations = async (req, res) => {
    try {
        const { facility_id } = req.query;
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        const facilityFilter = facilityIds.length > 0 ? { Id_PhongKham: { [Op.in]: facilityIds } } : {};

        const today = new Date().toISOString().split('T')[0];
        const sessions = await DatLich.findAll({
            where: facilityFilter,
            include: [{
                model: LichKham,
                where: { LoaiKham: 'Online', NgayDate: today }
            }, {
                model: BenhNhan,
                include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }]
            }],
            order: [[LichKham, 'GioBatDau', 'ASC']]
        });

        const result = sessions.map(s => ({
            id: s.Id_DatLich,
            patient: `${s.BenhNhan?.NguoiDung?.Ho || ''} ${s.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
            doctor: `BS. ${s.LichKham?.BacSi?.NguoiDung?.Ten || 'Chưa phân' }`,
            status: s.TrangThai,
            time: s.LichKham?.GioBatDau,
            quality: 'Good' // Mocked quality metric
        }));

        res.json(result);
    } catch (error) {
        console.error('StaffGetOnlineConsultations Error:', error);
        res.status(500).json({ detail: 'Error fetching online sessions' });
    }
};

/**
 * STAFF-16: Get Support Conversations (Active triage/chat)
 */
exports.getSupportConversations = async (req, res) => {
    try {
        const { facility_id } = req.query;
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        const facilityFilter = facilityIds.length > 0 ? { Id_PhongKham: { [Op.in]: facilityIds } } : {};

        const { AITuVanPhien } = require('../models');
        const conversations = await AITuVanPhien.findAll({
            where: facilityFilter,
            include: [{ model: NguoiDung, as: 'nguoiDung', attributes: ['Ho', 'Ten', 'Email'] }],
            order: [['NgayCapNhat', 'DESC']],
            limit: 20
        });

        const result = conversations.map(c => ({
            id: c.Id_AITuVanPhien,
            name: `${c.nguoiDung?.Ho || ''} ${c.nguoiDung?.Ten || ''}`.trim(),
            lastMsg: c.ChuanDoanSoBo || 'Đang tư vấn...',
            time: 'Vừa xong',
            unread: 0
        }));

        res.json(result);
    } catch (error) {
        console.error('StaffGetSupportConversations Error:', error);
        res.status(500).json({ detail: 'Error fetching support conversations' });
    }
};
