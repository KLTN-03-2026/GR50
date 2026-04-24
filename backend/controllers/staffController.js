const { sequelize, NguoiDung, BacSi, BenhNhan, VaiTro, DatLich: Appointment, LichKham: DoctorSchedule, ChuyenKhoa, NguoiDung_VaiTro, PhongKham: Clinic, HoaDon, StaffProfile, Staff_Facility: StaffFacility, AITuVanPhien: AITriage } = require('../models');
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
    // Standardized models are available at top-level
    
    // Find staff profile for this user
    const staff = await StaffProfile.findOne({ where: { user_id: userId } });
    if (!staff) return [];

    // Find assigned facilities
    const links = await StaffFacility.findAll({ where: { staff_id: staff.id, is_active: true } });
    let allowedIds = links.map(l => l.facility_id);

    if (requestedFacilityId) {
        const reqId = parseInt(requestedFacilityId);
        return allowedIds.includes(reqId) ? [reqId] : [];
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
        // Use local date string to avoid UTC offset issues
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        // 1. Determine the scoped facilities
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        
        if (facilityIds.length === 0) {
            return res.status(403).json({ 
                detail: 'Tài khoản chưa được gán cơ sở y tế hoạt động.',
                no_facility: true 
            });
        }

        const facilityFilter = { Id_PhongKham: { [Op.in]: facilityIds } };
        
        // 2. Appointments Today (Scoped) - Join with DoctorSchedule to get NgayDate
        const appointmentsToday = await Appointment.count({
            where: { ...facilityFilter },
            include: [{
                model: DoctorSchedule,
                where: { NgayDate: todayStr },
                required: true
            }]
        });

        // 3. Waiting Patients (Scoped) - Patients who have checked in but not yet in consultation
        const waitingPatients = await Appointment.count({
            where: { 
                TrangThai: { [Op.in]: ['CHECKED_IN', 'WAITING'] },
                ...facilityFilter
            },
            include: [{
                model: DoctorSchedule,
                where: { NgayDate: todayStr },
                required: true
            }]
        });


        // 4. Doctors on Duty (Scoped to facility and having slots today)
        const activeDoctorsCount = await BacSi.count({
            distinct: true,
            col: 'Id_BacSi',
            include: [
                {
                    model: Clinic,
                    as: 'facilities',
                    where: { Id_PhongKham: { [Op.in]: facilityIds } },
                    required: true
                },
                {
                    model: DoctorSchedule,
                    where: { NgayDate: todayStr },
                    required: true
                }
            ],
            where: { TrangThai: 'HoatDong' }
        });

        // 5. Pending Confirmations (Scoped)
        const pendingConfirmations = await Appointment.count({
            where: { 
                TrangThai: { [Op.in]: ['ChoXacNhan', 'PENDING'] }, 
                ...facilityFilter 
            }
        });

        // 6. Online Appointments
        const onlineAppointments = await Appointment.count({
            where: { ...facilityFilter },
            include: [{
                model: DoctorSchedule,
                where: { NgayDate: todayStr, LoaiKham: 'Online' },
                required: true
            }]
        });

        // 7. Unpaid Invoices
        const unpaidInvoices = await HoaDon.count({
            where: { 
                TrangThai: { [Op.ne]: 'DaThanhToan' }, 
                ...facilityFilter 
            }
        });

        // 8. Recent Activity (Scoped)
        const recentActivity = await Appointment.findAll({
            where: { ...facilityFilter },
            include: [
                {
                    model: BenhNhan,
                    include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }]
                },
                {
                    model: DoctorSchedule,
                    where: { NgayDate: todayStr },
                    required: true,
                    include: [
                        { 
                            model: BacSi, 
                            include: [
                                { model: NguoiDung, attributes: ['Ho', 'Ten'] },
                                { model: ChuyenKhoa }
                            ] 
                        }
                    ]
                }
            ],
            order: [['NgayTao', 'DESC']],
            limit: 5
        });

        // 9. Facility Info for Header
        const activeFacility = facilityIds.length === 1 ? await Clinic.findByPk(facilityIds[0]) : null;

        res.json({
            appointments_today: appointmentsToday,
            waiting_patients: waitingPatients,
            active_doctors: activeDoctorsCount,
            pending_confirmations: pendingConfirmations,
            online_appointments: onlineAppointments,
            unpaid_invoices_count: unpaidInvoices,
            facility_name: activeFacility ? activeFacility.TenPhongKham : 'Đa cơ sở',
            recent_activity: recentActivity.map(a => ({
                id: a.Id_DatLich,
                patient_name: `${a.BenhNhan?.NguoiDung?.Ho || ''} ${a.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
                doctor_name: `${a.DoctorSchedule?.BacSi?.NguoiDung?.Ho || ''} ${a.DoctorSchedule?.BacSi?.NguoiDung?.Ten || ''}`.trim(),
                status: a.TrangThai,
                time: a.DoctorSchedule?.GioBatDau ? a.DoctorSchedule.GioBatDau.substring(0, 5) : '--:--',
                specialty: a.DoctorSchedule?.BacSi?.ChuyenKhoa?.TenChuyenKhoa || 'Tổng quát',
                queue_number: a.STT_HangCho,
                code: a.MaDatLich
            })),

            system_status: 'Ổn định'
        });
    } catch (error) {
        console.error('StaffDashboardStats Error:', error);
        res.status(500).json({ detail: 'Lỗi khi lấy thống kê vận hành cơ sở', error: error.message });
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
        const { status, date, facility_id, query } = req.query;
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        if (facilityIds.length === 0) return res.status(403).json({ detail: 'Access denied to this facility' });
        
        let whereClause = { Id_PhongKham: { [Op.in]: facilityIds } };

        if (status && status !== 'all') whereClause.TrangThai = status;
        if (query) {
            whereClause[Op.or] = [
                { MaDatLich: { [Op.like]: `%${query}%` } },
                { '$BenhNhan.NguoiDung.Ho$': { [Op.like]: `%${query}%` } },
                { '$BenhNhan.NguoiDung.Ten$': { [Op.like]: `%${query}%` } },
                { '$BenhNhan.NguoiDung.Email$': { [Op.like]: `%${query}%` } },
                { '$BenhNhan.NguoiDung.SoDienThoai$': { [Op.like]: `%${query}%` } }
            ];
        }
        
        let includeClause = [
            {
                model: BenhNhan,
                include: [{ model: NguoiDung, attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai'] }]
            },
            {
                model: DoctorSchedule,
                include: [{
                    model: BacSi,
                    include: [
                        { model: NguoiDung, attributes: ['Ho', 'Ten'] },
                        { model: ChuyenKhoa }
                    ]
                }]
            }
        ];

        if (date) {
            includeClause[1].where = { NgayDate: date };
            includeClause[1].required = true;
        }
        
        const appointments = await Appointment.findAll({
            where: whereClause,
            include: includeClause,
            order: [['NgayTao', 'DESC']]
        });

        const result = appointments.map(a => ({
            id: a.Id_DatLich,
            patient_name: `${a.BenhNhan?.NguoiDung?.Ho || ''} ${a.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
            doctor_name: `${a.DoctorSchedule?.BacSi?.NguoiDung?.Ho || ''} ${a.DoctorSchedule?.BacSi?.NguoiDung?.Ten || ''}`.trim(),
            specialty: a.DoctorSchedule?.BacSi?.ChuyenKhoa?.TenChuyenKhoa,
            status: a.TrangThai,
            time: a.DoctorSchedule?.KhungGio,
            date: a.NgayHen || a.ThoiDiemDat,
            fee: a.GiaTien
        }));

        res.json(appointments);
    } catch (error) {
        console.error('StaffGetAppointments Error:', error);
        res.status(500).json({ detail: 'Error fetching appointments' });
    }
};

exports.checkInAppointment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { facility_id } = req.body;

        const appointment = await Appointment.findByPk(id, {
            include: [{ model: DoctorSchedule }]
        });

        if (!appointment) return res.status(404).json({ detail: 'Appointment not found' });
        
        // Verify facility access
        const facilityIds = await getStaffFacilities(req.user.id, facility_id);
        if (!facilityIds.includes(appointment.Id_PhongKham)) {
            return res.status(403).json({ detail: 'You can only check-in for your assigned facility' });
        }

        if (['CHECKED_IN', 'WAITING', 'COMPLETED', 'CANCELLED'].includes(appointment.TrangThai)) {
            return res.status(400).json({ detail: `Cannot check-in. Current status: ${appointment.TrangThai}` });
        }

        // Calculate queue number for this doctor and today
        const todayStr = appointment.DoctorSchedule.NgayDate;
        const lastInQueue = await Appointment.findOne({
            include: [{
                model: DoctorSchedule,
                where: { 
                    Id_BacSi: appointment.DoctorSchedule.Id_BacSi,
                    NgayDate: todayStr
                }
            }],
            where: {
                STT_HangCho: { [Op.ne]: null }
            },
            order: [['STT_HangCho', 'DESC']],
            transaction: t
        });

        const nextQueueNumber = (lastInQueue?.STT_HangCho || 0) + 1;

        await appointment.update({
            TrangThai: 'CHECKED_IN',
            CheckedInAt: new Date(),
            CheckedInBy: req.user.id,
            STT_HangCho: nextQueueNumber
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Check-in successful', queue_number: nextQueueNumber });
    } catch (error) {
        await t.rollback();
        console.error('CheckIn Error:', error);
        res.status(500).json({ detail: 'Error during check-in' });
    }
};


/**
 * STAFF-05: Check-in & Status Management
 */
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // CHECKED_IN, WAITING, etc.

        const appointment = await Appointment.findByPk(id);
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
        if (facilityIds.length === 0) return res.status(403).json({ detail: 'Access denied to this facility' });
        const facilityFilter = { Id_PhongKham: { [Op.in]: facilityIds } };


        
        const invoices = await HoaDon.findAll({
            where: facilityFilter,
            include: [
                {
                    model: Appointment,
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
            patient_name: `${i.Appointment?.BenhNhan?.NguoiDung?.Ho || ''} ${i.Appointment?.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
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
        const Appointment = require('../models/Appointment');
        const appointment = await Appointment.findByPk(invoice.Id_DatLich);
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
        if (facilityIds.length === 0) return res.status(403).json({ detail: 'Access denied to this facility' });
        const facilityFilter = { Id_PhongKham: { [Op.in]: facilityIds } };



        const doctors = await BacSi.findAll({
            where: { TrangThai: 'HoatDong' },
            include: [
                { model: NguoiDung, attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai'] },
                { model: ChuyenKhoa },
                { 
                    model: Clinic, 
                    as: 'facilities',
                    where: facilityFilter,
                    required: facilityIds.length > 0
                }
            ]
        });

        const result = doctors.map(d => ({
            id: d.Id_BacSi,
            full_name: `${d.NguoiDung?.Ho || ''} ${d.NguoiDung?.Ten || ''}`.trim(),
            specialty: d.ChuyenKhoa?.TenChuyenKhoa,
            clinic: d.Clinic?.TenPhongKham || d.NoiLamViec,
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
        if (facilityIds.length === 0) return res.status(403).json({ detail: 'Access denied to this facility' });
        const facilityFilter = { Id_PhongKham: { [Op.in]: facilityIds } };



        const triageItems = await AITriage.findAll({
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

        const session = await AITriage.findByPk(triageId);
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
        const appointment = await Appointment.findByPk(id, {
            include: [{ model: DoctorSchedule, where: { LoaiKham: 'Online' } }]
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
        
        // Check if staff has access to this slot's facility
        const slot = await DoctorSchedule.findByPk(slotId);
        if (!slot) return res.status(404).json({ detail: 'Slot not found' });
        
        const facilityIds = await getStaffFacilities(req.user.id, slot.Id_PhongKham);
        if (facilityIds.length === 0) return res.status(403).json({ detail: 'You do not have permission to book at this facility' });

        // Generate booking code
        const maAppointment = `DL${Date.now().toString().slice(-6)}`;

        const appointment = await Appointment.create({
            MaDatLich: maAppointment,
            Id_BenhNhan: patientId,
            Id_LichKham: slotId,
            Id_PhongKham: slot.Id_PhongKham, // Crucial for scoping
            Id_BacSi: slot.Id_BacSi,
            TrangThai: 'DaXacNhan', // Staff bookings are auto-confirmed
            GhiChu: note,
            ThoiDiemDat: new Date(),
            NgayHen: slot.NgayDate // Assuming slot has NgayDate
        });


        res.json({ message: 'Appointment created successfully', id: appointment.Id_DatLich, code: maAppointment });
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
        if (facilityIds.length === 0) return res.status(403).json({ detail: 'Access denied to this facility' });
        const facilityFilter = { Id_PhongKham: { [Op.in]: facilityIds } };



        const today = new Date().toISOString().split('T')[0];
        const sessions = await Appointment.findAll({
            where: facilityFilter,
            include: [{
                model: DoctorSchedule,
                where: { LoaiKham: 'Online', NgayDate: today }
            }, {
                model: BenhNhan,
                include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }]
            }],
            order: [[DoctorSchedule, 'GioBatDau', 'ASC']]
        });

        const result = sessions.map(s => ({
            id: s.Id_DatLich,
            patient: `${s.BenhNhan?.NguoiDung?.Ho || ''} ${s.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
            doctor: `BS. ${s.DoctorSchedule?.BacSi?.NguoiDung?.Ten || 'Chưa phân' }`,
            status: s.TrangThai,
            time: s.DoctorSchedule?.GioBatDau,
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
        if (facilityIds.length === 0) return res.status(403).json({ detail: 'Access denied to this facility' });
        const facilityFilter = { Id_PhongKham: { [Op.in]: facilityIds } };



        const conversations = await AITriage.findAll({
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
