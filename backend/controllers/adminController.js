const { sequelize, ThanhToan, DatLich: Appointment, BenhNhan, NguoiDung, BacSi, VaiTro, ChuyenKhoa, NguoiDung_VaiTro, PhongKham: Clinic, BacSi_PhongKham: DoctorFacility, StaffProfile, Staff_Facility: StaffFacility, AITuVanPhien: AITriage, LichKham: DoctorSchedule, HoaDon, AdminProfile, DoctorFacilitySchedule, DoctorOnlineSchedule } = require('../models');

const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');


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
    return Math.random().toString(36).slice(-8); // 8 character random string
};

const getAdminScope = (req) => {
    const { admin_type, facility_id } = req.user;
    if (admin_type === 'SUPER_ADMIN') return {};
    return { facility_id };
};

const getAdminWhere = (req, fieldName = 'Id_PhongKham') => {
    const scope = getAdminScope(req);
    if (!scope.facility_id) return {};
    return { [fieldName]: scope.facility_id };
};


exports.getStats = async (req, res) => {
    try {
        const { admin_type } = req.user;

        if (admin_type === 'SUPER_ADMIN') {
            // Super Admin gets System Overview
            const total_facilities = await Clinic.count();
            const total_admins = await AdminProfile.count();
            const total_accounts = await NguoiDung.count();
            const inactive_facilities = await Clinic.count({ where: { TrangThai: 'NgungHoatDong' } });

            return res.json({
                admin_type: 'SUPER_ADMIN',
                system_overview: {
                    total_facilities,
                    inactive_facilities,
                    total_admins,
                    total_accounts,
                    api_status: 'online',
                    ai_service_status: 'active'
                }
            });
        }

        // Facility Admin gets detailed operational stats
        const facilityFilter = getAdminWhere(req);
        
        const total_doctors = await BacSi.count({
            include: [{ model: Clinic, as: 'facilities', where: { Id_PhongKham: facilityFilter.Id_PhongKham } }]
        });
        const total_patients = await BenhNhan.count({
            include: [{ 
                model: Appointment, 
                as: 'appointments',
                where: facilityFilter,
                required: true
            }],
            distinct: true
        });

        const total_appointments = await Appointment.count({ where: { ...facilityFilter, isVisible: true } });
        const pending_appointments = await Appointment.count({ where: { ...facilityFilter, isVisible: true, TrangThai: { [Op.in]: ['PENDING', 'ChoXacNhan'] } } });
        const completed_appointments = await Appointment.count({ where: { ...facilityFilter, isVisible: true, TrangThai: { [Op.in]: ['COMPLETED', 'DaKham'] } } });

        const payments = await ThanhToan.findAll({ 
            where: { 
                TrangThai: { [Op.in]: ['SUCCESS', 'PAID', 'ThanhCong'] },
                ...facilityFilter
            } 
        });
        const total_revenue = payments.reduce((sum, p) => sum + parseFloat(p.SoTien || 0), 0);

        // Lấy thông tin cơ sở
        const myClinic = await Clinic.findByPk(facilityFilter.Id_PhongKham);

        res.json({
            admin_type: 'FACILITY_ADMIN',
            facility_name: myClinic ? myClinic.TenPhongKham : 'Cơ sở của tôi',
            total_patients,
            total_doctors,
            total_appointments,
            pending_appointments,
            completed_appointments,
            total_revenue
        });

    } catch (error) {
        console.error('AdminStats Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi lấy thống kê' });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        if (req.user.admin_type === 'SUPER_ADMIN') {
            return res.status(403).json({ detail: 'Chức năng này thuộc quyền Admin cơ sở y tế.' });
        }
        const facilityFilter = getAdminWhere(req);
        const bacsis = await BacSi.findAll({
            include: [
                { model: NguoiDung }, 
                { model: ChuyenKhoa },
                { 
                    model: Clinic, 
                    as: 'facilities', 
                    where: facilityFilter.Id_PhongKham ? { Id_PhongKham: facilityFilter.Id_PhongKham } : {},
                    required: !!facilityFilter.Id_PhongKham
                }
            ]
        });


        res.json(bacsis.map(d => ({
            id: d.Id_BacSi,
            user_id: d.Id_NguoiDung,
            full_name: `${d.NguoiDung.Ho} ${d.NguoiDung.Ten}`,
            email: d.NguoiDung.Email,
            phone_number: d.NguoiDung.SoDienThoai,
            avatar_url: d.NguoiDung.AnhDaiDien,
            status: d.TrangThai === 'HoatDong' ? 'approved' : 'pending',
            specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : '',
            bio: d.GioiThieu,
            experience_years: d.SoNamKinhNghiem,
            consultation_fee: d.PhiTuVan
        })));

    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getPatients = async (req, res) => {
    try {
        if (req.user.admin_type === 'SUPER_ADMIN') {
            return res.status(403).json({ detail: 'Chức năng này thuộc quyền Admin cơ sở y tế.' });
        }
        const facilityFilter = getAdminWhere(req);
        const hasFacility = !!facilityFilter.Id_PhongKham;
        
        let benhnhans;
        if (hasFacility) {
            benhnhans = await BenhNhan.findAll({ 
                include: [
                    { model: NguoiDung },
                    { 
                        model: Appointment, 
                        as: 'appointments',
                        where: facilityFilter,
                        required: true,
                        attributes: []
                    }
                ],
                distinct: true
            });
        } else {
            benhnhans = await BenhNhan.findAll({ include: [{ model: NguoiDung }] });
        }

        res.json(benhnhans.map(p => ({
            user_id: p.Id_NguoiDung,
            full_name: `${p.NguoiDung?.Ho || ''} ${p.NguoiDung?.Ten || ''}`.trim(),
            email: p.NguoiDung?.Email,
            phone_number: p.NguoiDung?.SoDienThoai,
            avatar_url: p.NguoiDung?.AnhDaiDien,
            date_of_birth: p.NguoiDung?.NgaySinh,
            gender: p.NguoiDung?.GioiTinh,
            address: ''
        })));
    } catch (error) {
        console.error('getPatients error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query; // 'approved' or 'rejected'

        const dbStatus = status === 'approved' ? 'HoatDong' : 'NgungHoatDong';
        await BacSi.update({ TrangThai: dbStatus }, { where: { Id_NguoiDung: id } });
        res.json({ message: `Doctor ${status} successfully` });
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await NguoiDung.findByPk(id);
        if (!user) return res.status(404).json({ detail: 'Không tìm thấy người dùng' });

        // Update user status instead of deleting
        await user.update({ TrangThai: 'Khoa' });

        // If it's a doctor, also update doctor status
        await BacSi.update({ TrangThai: 'NgungHoatDong' }, { where: { Id_NguoiDung: id } });

        res.json({ message: 'Tài khoản người dùng đã được khóa thành công.' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi khóa tài khoản' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        if (req.user.admin_type === 'SUPER_ADMIN') {
            return res.status(403).json({ detail: 'Chức năng này thuộc quyền Admin cơ sở y tế.' });
        }
        const facilityFilter = getAdminWhere(req);
        const payments = await ThanhToan.findAll({ 
            where: facilityFilter,
            include: [{ model: BenhNhan, include: [NguoiDung] }] 
        });

        const formattedPayments = payments.map(p => ({
            payment_id: p.Id_ThanhToan,
            status: ['SUCCESS', 'PAID', 'ThanhCong'].includes(p.TrangThai) ? 'completed' : 'pending',

            doctor_name: 'Unknown Doctor',
            patient_name: p.BenhNhan ? `${p.BenhNhan.NguoiDung.Ho} ${p.BenhNhan.NguoiDung.Ten}` : 'Unknown',
            amount: parseFloat(p.SoTien),
            payment_method: p.PhuongThuc,
            transaction_id: p.MaGiaoDich,
            created_at: p.NgayTao,
            payment_date: p.NgayTao
        }));

        res.json({
            stats: {
                total_revenue: formattedPayments.filter(x => x.status === 'completed').reduce((s, p) => s + p.amount, 0),
                completed_payments: formattedPayments.filter(x => x.status === 'completed').length,
                pending_payments: formattedPayments.filter(x => x.status !== 'completed').length,
                total_payments: payments.length
            },

            payments: formattedPayments
        });
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};


exports.createUser = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            email, password, full_name, phone, role,
            // Doctor fields
            specialty_id, experience_years, bio,
            // Staff fields
            employee_code, position_title,
            // Multi-facility data
            facilities
        } = req.body;

        if (!full_name || !role) {
            await t.rollback();
            return res.status(400).json({ detail: 'Thiếu thông tin bắt buộc (Họ tên, Vai trò).' });
        }

        // Requirement check: Doctor and Staff MUST have facilities
        if ((role === 'doctor' || role === 'staff') && (!facilities || !Array.isArray(facilities) || facilities.length === 0)) {
            await t.rollback();
            return res.status(400).json({ detail: `${role === 'doctor' ? 'Bác sĩ' : 'Nhân viên'} phải được gán ít nhất một cơ sở y tế.` });
        }

        const facilityFilter = getAdminWhere(req);
        const hasFacility = !!facilityFilter.Id_PhongKham;

        const generatedEmail = email || generateEmail(full_name);
        const generatedPassword = password || generatePassword();

        const existingUser = await NguoiDung.findOne({ where: { Email: generatedEmail } });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ detail: 'Email đã tồn tại trong hệ thống.' });
        }

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');

        const user = await NguoiDung.create({
            Email: generatedEmail,
            MatKhau: hashedPassword,
            Ho: ho,
            Ten: ten,
            SoDienThoai: phone || null,
            TrangThai: 'HoatDong',
            YeuCauDoiMatKhau: true,
            Id_ChuyenKhoa_QuanLy: null
        }, { transaction: t });

        // Assign Role
        const vt = await VaiTro.findOne({ where: { MaVaiTro: role } });
        if (vt) {
            await NguoiDung_VaiTro.create({ 
                Id_NguoiDung: user.Id_NguoiDung, 
                Id_VaiTro: vt.Id_VaiTro 
            }, { transaction: t });
        }

        if (role === 'doctor') {
            const doctor = await BacSi.create({
                Id_NguoiDung: user.Id_NguoiDung,
                Id_ChuyenKhoa: specialty_id || null,
                SoNamKinhNghiem: experience_years || 0,
                PhiTuVan: (facilities && facilities[0]) ? facilities[0].consultation_fee_offline : 0,
                GioiThieu: bio || null,
                TrangThai: 'HoatDong'
            }, { transaction: t });

            // Enforce single facility for doctors
            const primaryFacility = facilities.find(f => !hasFacility || f.facility_id == facilityFilter.Id_PhongKham);
            
            if (primaryFacility) {
                await DoctorFacility.create({
                    doctor_id: doctor.Id_BacSi,
                    facility_id: primaryFacility.facility_id,
                    is_primary: true, // Always primary for single facility
                    supports_online: primaryFacility.supports_online !== undefined ? primaryFacility.supports_online : true,
                    supports_offline: primaryFacility.supports_offline !== undefined ? primaryFacility.supports_offline : true,
                    consultation_fee_online: primaryFacility.consultation_fee_online || 0,
                    consultation_fee_offline: primaryFacility.consultation_fee_offline || 0,
                    is_active: primaryFacility.is_active !== undefined ? primaryFacility.is_active : true
                }, { transaction: t });
            }
        } else if (role === 'staff') {
            const staff = await StaffProfile.create({
                user_id: user.Id_NguoiDung,
                employee_code: employee_code || `STF${Date.now()}`,
                position_title: position_title || 'Nhân viên',
                status: 'active'
            }, { transaction: t });

            for (const f of facilities) {
                // If sub-admin, only allow assigning to their own facility
                if (hasFacility && f.facility_id != facilityFilter.Id_PhongKham) continue;

                await StaffFacility.create({
                    staff_id: staff.id,
                    facility_id: f.facility_id,
                    can_reception: f.can_reception || false,
                    can_booking_assist: f.can_booking_assist || false,
                    can_manage_appointments: f.can_manage_appointments || false,
                    can_payment: f.can_handle_payments || f.can_payment || false,
                    can_support_chat: f.can_support_chat || false,
                    can_video_support: f.can_video_support || false,
                    is_active: f.is_active !== undefined ? f.is_active : true
                }, { transaction: t });
            }
        } else if (role === 'patient') {
            await BenhNhan.create({
                Id_NguoiDung: user.Id_NguoiDung,
                SoDienThoaiLienHe: phone || null
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({
            message: 'Tạo tài khoản thành công và đã gán cơ sở y tế.',
            user_id: user.Id_NguoiDung,
            temp_password: generatedPassword
        });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Admin.createUser Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi tạo người dùng: ' + error.message });
    }
};

exports.createAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            email, password, full_name, phone, 
            admin_type, facility_id, 
            permissions 
        } = req.body;

        if (req.user.admin_type !== 'SUPER_ADMIN') {
            await t.rollback();
            return res.status(403).json({ detail: 'Chỉ Super Admin mới có quyền tạo Admin mới.' });
        }

        if (!email || !password || !full_name) {
            await t.rollback();
            return res.status(400).json({ detail: 'Thiếu thông tin bắt buộc (Email, Mật khẩu, Họ tên).' });
        }

        const exists = await NguoiDung.findOne({ where: { Email: email } });
        if (exists) {
            await t.rollback();
            return res.status(400).json({ detail: 'Email đã tồn tại.' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const names = full_name.split(' ');
        const ten = names.pop();
        const ho = names.join(' ');

        const user = await NguoiDung.create({
            Email: email,
            MatKhau: hashed,
            Ho: ho,
            Ten: ten,
            SoDienThoai: phone || null,
            TrangThai: 'HoatDong'
        }, { transaction: t });

        const vt = await VaiTro.findOne({ where: { MaVaiTro: 'admin' } });
        if (vt) {
            await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro }, { transaction: t });
        }

        // Create Admin Profile
        await AdminProfile.create({
            user_id: user.Id_NguoiDung,
            admin_type: admin_type || 'FACILITY_ADMIN',
            facility_id: admin_type === 'FACILITY_ADMIN' ? facility_id : null,
            can_manage_doctors: permissions?.can_manage_doctors || false,
            can_manage_staff: permissions?.can_manage_staff || false,
            can_manage_patients: permissions?.can_manage_patients || false,
            can_view_stats: permissions?.can_view_stats || false,
            can_manage_payments: permissions?.can_manage_payments || false,
            can_manage_specialties: admin_type === 'SUPER_ADMIN',
            can_manage_admins: admin_type === 'SUPER_ADMIN'
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: 'Tạo tài khoản quản trị viên thành công', id: user.Id_NguoiDung });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Admin.createAdmin Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi tạo quản trị viên' });
    }
};


exports.getAdmins = async (req, res) => {
    try {
        const facilityFilter = getAdminWhere(req);
        
        // If not Super Admin, only show admins from the same facility
        const whereClause = facilityFilter.Id_PhongKham ? { facility_id: facilityFilter.Id_PhongKham } : {};

        const admins = await AdminProfile.findAll({
            where: whereClause,
            include: [
                { model: NguoiDung, as: 'user', attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai', 'TrangThai', 'AnhDaiDien'] },
                { model: Clinic, as: 'assignedFacility', attributes: ['TenPhongKham'] }
            ]
        });

        const mapped = admins.map(a => ({
            id: a.user_id,
            full_name: a.user ? `${a.user.Ho} ${a.user.Ten}` : 'Unknown',
            email: a.user?.Email,
            admin_type: a.admin_type,
            assigned_facility: a.assignedFacility?.TenPhongKham || 'Toàn hệ thống',
            created_at: a.createdAt,
            admin_permissions: {
                can_manage_doctors: a.can_manage_doctors,
                can_manage_staff: a.can_manage_staff,
                can_manage_patients: a.can_manage_patients,
                can_view_stats: a.can_view_stats,
                can_manage_payments: a.can_manage_payments,
                can_manage_specialties: a.can_manage_specialties,
                can_create_admins: a.can_manage_admins
            }
        }));

        res.json(mapped);
    } catch (error) {
        console.error('getAdmins error:', error);
        res.status(500).json({ detail: 'Lỗi khi lấy danh sách admin' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ detail: 'Không thể tự khóa tài khoản của chính mình' });
        }
        const user = await NguoiDung.findByPk(id);
        if (!user) return res.status(404).json({ detail: 'Không tìm thấy quản trị viên' });

        await user.update({ TrangThai: 'Khoa' });
        res.json({ message: 'Đã khóa tài khoản quản trị viên thành công' });
    } catch (error) {
        console.error('Admin.deleteAdmin Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi khóa quản trị viên' });
    }
};

exports.updatePermissions = async (req, res) => {
    try {
        const { admin_id, permissions } = req.body;
        
        const ap = await AdminProfile.findOne({ where: { user_id: admin_id } });
        if (!ap) return res.status(404).json({ detail: 'Không tìm thấy hồ sơ admin' });

        await ap.update({
            can_manage_doctors: permissions.can_manage_doctors !== undefined ? permissions.can_manage_doctors : ap.can_manage_doctors,
            can_manage_staff: permissions.can_manage_staff !== undefined ? permissions.can_manage_staff : ap.can_manage_staff,
            can_manage_patients: permissions.can_manage_patients !== undefined ? permissions.can_manage_patients : ap.can_manage_patients,
            can_view_stats: permissions.can_view_stats !== undefined ? permissions.can_view_stats : ap.can_view_stats,
            can_manage_payments: permissions.can_manage_payments !== undefined ? permissions.can_manage_payments : ap.can_manage_payments,
            can_manage_admins: permissions.can_create_admins !== undefined ? permissions.can_create_admins : ap.can_manage_admins
        });

        res.json({ message: 'Cập nhật quyền thành công' });
    } catch (error) {
        console.error('updatePermissions error:', error);
        res.status(500).json({ detail: 'Lỗi khi cập nhật quyền' });
    }
};

exports.getReports = async (req, res) => {
    try {
        if (req.user.admin_type === 'SUPER_ADMIN') {
            return res.status(403).json({ detail: 'Chức năng này thuộc quyền Admin cơ sở y tế.' });
        }
        const { from, to } = req.query;
        const facilityFilter = getAdminWhere(req);
        const dateWhere = {};
        if (from && to) {
            dateWhere.NgayTao = { [Op.between]: [new Date(from), new Date(to)] };
        }

        const whereClause = { ...dateWhere, ...facilityFilter };

        const appointments = await Appointment.findAll({ where: whereClause });
        const payments = await ThanhToan.findAll({ where: whereClause });

        const totalRevenue = payments
            .filter(p => ['SUCCESS', 'PAID', 'ThanhCong'].includes(p.TrangThai))
            .reduce((sum, p) => sum + parseFloat(p.SoTien || 0), 0);


        const byMonth = {};
        appointments.forEach(a => {
            const date = new Date(a.NgayTao);
            if (!isNaN(date.getTime())) {
                const month = date.toISOString().slice(0, 7);
                if (!byMonth[month]) byMonth[month] = { month, count: 0, revenue: 0 };
                byMonth[month].count++;
            }
        });

        payments.filter(p => ['SUCCESS', 'PAID', 'ThanhCong'].includes(p.TrangThai)).forEach(p => {
            const date = new Date(p.NgayTao);
            if (!isNaN(date.getTime())) {
                const month = date.toISOString().slice(0, 7);
                if (byMonth[month]) byMonth[month].revenue += parseFloat(p.SoTien || 0);
            }
        });


        res.json({
            total_appointments: appointments.length,
            total_revenue: totalRevenue,
            completed: appointments.filter(a => ['COMPLETED', 'DaKham'].includes(a.TrangThai)).length,
            cancelled: appointments.filter(a => ['CANCELLED', 'Huy'].includes(a.TrangThai)).length,
            by_month: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
        });

    } catch (error) {
        console.error('Admin.getReports Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi xuất báo cáo' });
    }
};

exports.getAIDiagnoses = async (req, res) => {
    try {
        // Admin view: Global monitoring of AI diagnoses
        // Assuming a model or table for AI logs/sessions exists
        const facilityFilter = getAdminWhere(req, 'dl.Id_PhongKham');
        const facilityClause = facilityFilter['dl.Id_PhongKham'] ? `AND dl.Id_PhongKham = ${facilityFilter['dl.Id_PhongKham']}` : '';

        const logs = await sequelize.query(`
            SELECT nd.Ho, nd.Ten, nd.Email, ck.TenChuyenKhoa, lk.NgayDate, lk.GioBatDau, dl.TrieuChungSoBo
            FROM datlich dl
            JOIN benhnhan bn ON dl.Id_BenhNhan = bn.Id_BenhNhan
            JOIN nguoidung nd ON bn.Id_NguoiDung = nd.Id_NguoiDung
            JOIN lichkham lk ON dl.Id_LichKham = lk.Id_LichKham
            LEFT JOIN bacsi bs ON lk.Id_BacSi = bs.Id_BacSi
            LEFT JOIN chuyenkhoa ck ON bs.Id_ChuyenKhoa = ck.Id_ChuyenKhoa
            WHERE (dl.TrieuChungSoBo LIKE '%AI:%' OR dl.TrieuChungSoBo LIKE '%Chuẩn đoán AI:%') ${facilityClause}
            ORDER BY lk.NgayDate DESC, lk.GioBatDau DESC
            LIMIT 100
        `, { type: sequelize.QueryTypes.SELECT });

        res.json({
            detail: 'Giám sát chẩn đoán AI toàn hệ thống',
            diagnoses: logs.map(l => ({
                patient: `${l.Ho} ${l.Ten}`,
                email: l.Email,
                specialty: l.TenChuyenKhoa || 'Chưa phân khoa',
                date: l.NgayDate,
                time: l.GioBatDau,
                ai_note: l.TrieuChungSoBo
            }))
        });

    } catch (error) {
        console.error('Admin.getAIDiagnoses Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi giám sát AI' });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const whereClause = {};
        if (req.user.admin_type === 'FACILITY_ADMIN') {
            whereClause.Id_PhongKham = req.user.facility_id;
        }
        whereClause.isVisible = true;

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { 
                    model: BenhNhan, 
                    include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }] 
                },
                { 
                    model: DoctorSchedule,
                    as: 'DoctorSchedule',
                    include: [
                        { model: BacSi, as: 'Doctor', include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }] }
                    ]
                },
                { model: Clinic, as: 'Clinic', attributes: ['TenPhongKham'] }
            ],
            order: [[{ model: DoctorSchedule, as: 'DoctorSchedule' }, 'NgayDate', 'DESC']]
        });


        const formatted = appointments.map(apt => {
            const d = apt.toJSON();
            return {
                id: d.Id_DatLich,
                MaDatLich: d.MaDatLich,
                patient_name: `${d.BenhNhan?.NguoiDung?.Ho || ''} ${d.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
                doctor_name: `${d.DoctorSchedule?.Doctor?.NguoiDung?.Ho || ''} ${d.DoctorSchedule?.Doctor?.NguoiDung?.Ten || ''}`.trim(),
                NgayKham: apt.DoctorSchedule?.NgayDate || 'N/A',
                GioKham: apt.DoctorSchedule?.GioBatDau || 'N/A',
                TrangThai: d.TrangThai,
                Clinic: d.Clinic?.TenPhongKham || 'N/A'
            };
        });

        res.json(formatted);


    } catch (error) {
        console.error('GetAllAppointments Error:', error);
        res.status(500).json({ detail: 'Lỗi khi lấy danh sách tất cả lịch hẹn' });
    }
};

exports.getDetailedStats = async (req, res) => {
    try {
        const { from, to, facility_id } = req.query;

        // Security check: If FACILITY_ADMIN, only allow their own facility
        let effectiveFacilityId = facility_id;
        if (req.user.admin_type === 'FACILITY_ADMIN') {
            effectiveFacilityId = req.user.facility_id;
        }

        const dateFilter = {};
        if (from && to) {
            dateFilter.NgayTao = { [Op.between]: [new Date(from), new Date(to)] };
        }

        const commonWhere = { ...dateFilter };
        if (effectiveFacilityId) commonWhere.Id_PhongKham = effectiveFacilityId;

        // 1. User Stats
        // For sub-admins, we might want to filter users belonging to that facility
        // Patients are usually global, but we can filter by who has booked at this facility
        
        const userStatsWhere = {};
        if (effectiveFacilityId) {
            // Complex filtering for users in a facility
        }

        const users = {
            total: await NguoiDung.count({
                include: effectiveFacilityId ? [{
                    model: BenhNhan,
                    required: true,
                    include: [{ model: Appointment, as: 'appointments', where: { Id_PhongKham: effectiveFacilityId }, required: true }]
                }] : []
            }),
            patients: await BenhNhan.count({
                include: effectiveFacilityId ? [{
                    model: Appointment,
                    as: 'appointments',
                    where: { Id_PhongKham: effectiveFacilityId },
                    required: true
                }] : [],
                distinct: true
            }),
            doctors: await BacSi.count({ 
                where: effectiveFacilityId ? { 
                    Id_BacSi: { [Op.in]: literal(`(SELECT doctor_id FROM bacsi_phongkham WHERE facility_id = ${effectiveFacilityId})`) } 
                } : {} 
            }),
            staff: await StaffProfile.count({ 
                where: effectiveFacilityId ? { 
                    user_id: { [Op.in]: literal(`(SELECT staff_id FROM staff_facilities WHERE facility_id = ${effectiveFacilityId})`) } 
                } : {} 
            }),
            active: await NguoiDung.count({ 
                where: { TrangThai: 'HoatDong' },
                include: effectiveFacilityId ? [{
                    model: BenhNhan,
                    required: true,
                    include: [{ model: Appointment, as: 'appointments', where: { Id_PhongKham: effectiveFacilityId }, required: true }]
                }] : []
            }),
        };

        // 2. Appointment Stats
        const appointmentWhere = { ...dateFilter, isVisible: true };
        if (effectiveFacilityId) appointmentWhere.Id_PhongKham = effectiveFacilityId;
        
        const appointments = {
            total: await Appointment.count({ where: appointmentWhere }),
            pending: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['PENDING', 'ChoXacNhan'] } } }),
            confirmed: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['CONFIRMED', 'DaXacNhan'] } } }),
            completed: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['COMPLETED', 'DaKham'] } } }),
            cancelled: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['CANCELLED', 'Huy'] } } }),
            online: await Appointment.count({ 
                where: appointmentWhere,
                include: [{ model: DoctorSchedule, as: 'DoctorSchedule', where: { LoaiKham: 'Online' } }]
            }),
            offline: await Appointment.count({ 
                where: appointmentWhere,
                include: [{ model: DoctorSchedule, as: 'DoctorSchedule', where: { LoaiKham: 'TrucTiep' } }]
            })
        };


        // 3. Revenue Stats
        const paymentWhere = { ...dateFilter, TrangThai: { [Op.in]: ['SUCCESS', 'PAID', 'ThanhCong'] } };
        if (effectiveFacilityId) paymentWhere.Id_PhongKham = effectiveFacilityId;
        
        const total_revenue = await ThanhToan.sum('SoTien', { where: paymentWhere }) || 0;
        
        // Revenue by period
        const revenue_by_period = await ThanhToan.findAll({
            attributes: [
                [fn('date_format', col('NgayTao'), '%Y-%m'), 'period'],
                [fn('sum', col('SoTien')), 'revenue']
            ],
            where: paymentWhere,
            group: ['period'],
            order: [[literal('period'), 'ASC']],
            limit: 6,
            raw: true
        });



        // 4. Specialty Stats (Appointments by Specialty)
        const specialtyWhere = { ...appointmentWhere };
        const specialty_stats = await Appointment.findAll({
            attributes: [
                [col('DoctorSchedule.Doctor.ChuyenKhoa.TenChuyenKhoa'), 'specialty'],
                [fn('count', col('DatLich.Id_DatLich')), 'appointment_count']
            ],
            where: specialtyWhere,
            include: [
                {
                    model: DoctorSchedule,
                    as: 'DoctorSchedule',
                    attributes: [],
                    include: [{
                        model: BacSi,
                        as: 'Doctor',
                        attributes: [],
                        include: [{ model: ChuyenKhoa, attributes: [] }]
                    }]
                }
            ],
            group: [col('DoctorSchedule.Doctor.ChuyenKhoa.TenChuyenKhoa')],
            raw: true
        });

        // Map to match frontend expected key if needed
        const mapped_specialty_stats = specialty_stats.map(s => ({
            specialty: s.specialty || 'Chưa phân khoa',
            doctor_count: s.appointment_count // Reusing the key name to avoid frontend changes
        }));



        // 5. Facility Stats
        const facility_counts = await Appointment.findAll({
            attributes: [
                [col('DatLich.Id_PhongKham'), 'Id_PhongKham'],
                [fn('count', col('DatLich.Id_DatLich')), 'count']
            ],
            where: { isVisible: true, ...(effectiveFacilityId ? { Id_PhongKham: effectiveFacilityId } : {}) },
            include: [{ 
                model: Clinic, 
                attributes: ['TenPhongKham'],
                as: 'Clinic'
            }],
            group: [col('DatLich.Id_PhongKham'), col('Clinic.Id_PhongKham'), col('Clinic.TenPhongKham')],
            raw: true
        });

        const facility_stats = facility_counts.map(fc => ({
            Id_PhongKham: fc.Id_PhongKham,
            TenPhongKham: fc['Clinic.TenPhongKham'],
            count: fc.count
        }));


        // 6. AI Stats
        const ai_stats = {
            total_sessions: await AITriage.count({ where: effectiveFacilityId ? { Id_PhongKham: effectiveFacilityId } : {} }),
            converted_to_booking: await Appointment.count({ 
                where: { 
                    TrieuChungSoBo: { [Op.like]: '%AI:%' },
                    ...(effectiveFacilityId ? { Id_PhongKham: effectiveFacilityId } : {})
                } 
            })
        };

        res.json({
            users,
            appointments,
            revenue: {
                total: total_revenue,
                by_period: revenue_by_period
            },
            specialties: mapped_specialty_stats,

            facilities: facility_stats,
            ai: ai_stats
        });

    } catch (error) {
        console.error('DetailedStats Error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ detail: 'Lỗi khi lấy dữ liệu thống kê chi tiết: ' + error.message });
    }
};
exports.getStaffs = async (req, res) => {
    try {
        const facilityFilter = getAdminWhere(req);
        const hasFacility = !!facilityFilter.Id_PhongKham;

        const staffs = await StaffProfile.findAll({
            include: [
                { model: NguoiDung, attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai', 'TrangThai', 'AnhDaiDien'] },
                { 
                    model: Clinic, 
                    as: 'facilities', 
                    attributes: ['TenPhongKham'],
                    where: hasFacility ? { Id_PhongKham: facilityFilter.Id_PhongKham } : {},
                    required: hasFacility
                }
            ]
        });
        
        const mappedStaffs = staffs.map(s => ({
            id: s.id,
            user_id: s.user_id,
            name: s.NguoiDung ? `${s.NguoiDung.Ho} ${s.NguoiDung.Ten}` : 'Unknown',
            email: s.NguoiDung?.Email,
            phone: s.NguoiDung?.SoDienThoai,
            employee_code: s.employee_code,
            position: s.position_title,
            status: s.status,
            avatar: s.NguoiDung?.AnhDaiDien,
            facilities: s.facilities ? s.facilities.map(f => ({
                id: f.Id_PhongKham,
                name: f.TenPhongKham,
                can_reception: f.Staff_Facility?.can_reception,
                can_payment: f.Staff_Facility?.can_payment
            })) : []
        }));
        res.json(mappedStaffs);
    } catch (error) {
        console.error('getStaffs error:', error);
        res.status(500).json({ detail: 'Lỗi khi lấy danh sách nhân viên' });
    }
};

exports.assignDoctorSchedule = async (req, res) => {
    try {
        const { doctor_id, facility_id, specialty_id, room_id, dayOfWeek, startTime, endTime, effectiveFrom, effectiveTo } = req.body;
        
        const fId = facility_id === '' ? null : parseInt(facility_id);
        const sId = specialty_id === '' ? null : parseInt(specialty_id);

        if (req.user.admin_type === 'FACILITY_ADMIN' && fId != req.user.facility_id) {
            return res.status(403).json({ detail: 'Bạn không có quyền gán lịch cho cơ sở khác.' });
        }

        // Enforce single facility rule: Check doctor's current assignment
        const currentAssignment = await DoctorFacility.findOne({ where: { doctor_id } });
        if (currentAssignment && currentAssignment.facility_id != fId) {
            return res.status(400).json({ detail: 'Bác sĩ này đã được phân công công tác tại một cơ sở y tế khác. Mỗi bác sĩ chỉ được làm việc tại 1 cơ sở duy nhất.' });
        }

        const schedule = await DoctorFacilitySchedule.create({
            doctorId: doctor_id,
            facilityId: fId,
            specialtyId: sId,
            roomId: room_id || null,
            dayOfWeek: parseInt(dayOfWeek),
            startTime,
            endTime,
            assignedByAdminId: req.user.id,
            effectiveFrom: effectiveFrom || null,
            effectiveTo: effectiveTo || null
        });

        res.status(201).json(schedule);
    } catch (error) {
        console.error('assignDoctorSchedule error:', error);
        res.status(500).json({ detail: 'Lỗi khi phân công lịch khám: ' + error.message });
    }
};

exports.getDoctorFacilitySchedules = async (req, res) => {
    try {
        const { doctor_id, facility_id } = req.query;
        const whereClause = {};
        if (doctor_id) whereClause.doctorId = doctor_id;
        if (facility_id) whereClause.facilityId = facility_id;
        
        if (req.user.admin_type === 'FACILITY_ADMIN') {
            whereClause.facilityId = req.user.facility_id;
        }

        const schedules = await DoctorFacilitySchedule.findAll({
            where: whereClause,
            include: [
                { model: BacSi, as: 'doctor', include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }] },
                { model: Clinic, as: 'facility', attributes: ['TenPhongKham'] },
                { model: ChuyenKhoa, as: 'specialty', attributes: ['TenChuyenKhoa'] }
            ]
        });

        res.json(schedules);
    } catch (error) {
        console.error('getDoctorFacilitySchedules error:', error);
        res.status(500).json({ detail: 'Lỗi khi tải danh sách lịch: ' + error.message });
    }
};

exports.deleteDoctorFacilitySchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await DoctorFacilitySchedule.findByPk(id);
        if (!schedule) return res.status(404).json({ detail: 'Schedule not found' });
        
        if (req.user.admin_type === 'FACILITY_ADMIN' && schedule.facilityId != req.user.facility_id) {
            return res.status(403).json({ detail: 'Permission denied' });
        }

        await schedule.destroy();
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ detail: 'Error deleting schedule' });
    }
};


