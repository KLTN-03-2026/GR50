const { sequelize, ThanhToan, DatLich: Appointment, BenhNhan, NguoiDung, BacSi, VaiTro, ChuyenKhoa, NguoiDung_VaiTro, PhongKham: Clinic, BacSi_PhongKham: DoctorFacility, StaffProfile, Staff_Facility: StaffFacility, AITuVanPhien: AITriage, LichKham: DoctorSchedule, HoaDon } = require('../models');

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

exports.getStats = async (req, res) => {
    try {
        // Global User Counts
        const total_users = await NguoiDung.count();
        const total_doctors = await BacSi.count();
        const approved_doctors = await BacSi.count({ where: { TrangThai: 'HoatDong' } });
        const total_patients = await BenhNhan.count();

        // Global Appointment Stats
        const total_appointments = await Appointment.count();
        const pending_appointments = await Appointment.count({ where: { TrangThai: { [Op.in]: ['PENDING', 'ChoXacNhan'] } } });
        const confirmed_appointments = await Appointment.count({ where: { TrangThai: { [Op.in]: ['CONFIRMED', 'DaXacNhan'] } } });
        const completed_appointments = await Appointment.count({ where: { TrangThai: { [Op.in]: ['COMPLETED', 'DaKham'] } } });
        const cancelled_appointments = await Appointment.count({ where: { TrangThai: { [Op.in]: ['CANCELLED', 'Huy'] } } });


        // Global Revenue
        const payments = await ThanhToan.findAll({ 
            where: { 
                TrangThai: { [Op.in]: ['ThanhCong', 'PAID'] } 
            } 
        });
        const total_revenue = payments.reduce((sum, p) => sum + parseFloat(p.SoTien || 0), 0);


        res.json({
            total_users,
            total_patients,
            total_doctors,
            approved_doctors,
            total_appointments,
            pending_appointments,
            confirmed_appointments,
            completed_appointments,
            cancelled_appointments,
            total_revenue,
            active_sessions: 0 // Mocked for now
        });
    } catch (error) {
        console.error('AdminGlobalStats Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi lấy thống kê hệ thống' });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const bacsis = await BacSi.findAll({
            include: [{ model: NguoiDung }, { model: ChuyenKhoa }]
        });

        res.json(bacsis.map(d => ({
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
        const benhnhans = await BenhNhan.findAll({ include: [{ model: NguoiDung }] });
        res.json(benhnhans.map(p => ({
            user_id: p.Id_NguoiDung,
            full_name: `${p.NguoiDung.Ho} ${p.NguoiDung.Ten}`,
            email: p.NguoiDung.Email,
            phone_number: p.NguoiDung.SoDienThoai,
            avatar_url: p.NguoiDung.AnhDaiDien,
            date_of_birth: p.NguoiDung.NgaySinh,
            gender: p.NguoiDung.GioiTinh,
            address: ''
        })));

    } catch (error) {
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
        const payments = await ThanhToan.findAll({ include: [{ model: BenhNhan, include: [NguoiDung] }] });

        const formattedPayments = payments.map(p => ({
            payment_id: p.Id_ThanhToan,
            status: ['ThanhCong', 'PAID'].includes(p.TrangThai) ? 'completed' : 'pending',

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

exports.getAdmins = async (req, res) => {
    try {
        const adminRole = await VaiTro.findOne({ where: { MaVaiTro: 'admin' } });
        if (!adminRole) return res.json([]);
        const admins = await NguoiDung.findAll({
            include: [{ model: VaiTro, where: { MaVaiTro: 'admin' }, through: { attributes: [] } }]
        });
        res.json(admins.map(a => ({
            id: a.Id_NguoiDung,
            full_name: `${a.Ho} ${a.Ten}`,
            email: a.Email,
            phone: a.SoDienThoai,
            created_at: a.NgayTao
        })));
    } catch (error) {
        console.error('Get admins error:', error);
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

            for (const f of facilities) {
                await DoctorFacility.create({
                    doctor_id: doctor.Id_BacSi,
                    facility_id: f.facility_id,
                    is_primary: f.is_primary || false,
                    supports_online: f.supports_online !== undefined ? f.supports_online : true,
                    supports_offline: f.supports_offline !== undefined ? f.supports_offline : true,
                    consultation_fee_online: f.consultation_fee_online || 0,
                    consultation_fee_offline: f.consultation_fee_offline || 0,
                    is_active: f.is_active !== undefined ? f.is_active : true
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
    try {
        const { email, password, full_name, phone } = req.body;
        if (!email || !password || !full_name) {
            return res.status(400).json({ detail: 'Thiếu thông tin bắt buộc (Email, Mật khẩu, Họ tên).' });
        }

        const exists = await NguoiDung.findOne({ where: { Email: email } });
        if (exists) return res.status(400).json({ detail: 'Email đã tồn tại.' });

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
        });

        const vt = await VaiTro.findOne({ where: { MaVaiTro: 'admin' } });
        if (vt) {
            await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
        }

        res.status(201).json({ message: 'Tạo tài khoản quản trị viên thành công', id: user.Id_NguoiDung });
    } catch (error) {
        console.error('Admin.createAdmin Error:', error);
        res.status(500).json({ detail: 'Lỗi máy chủ khi tạo quản trị viên' });
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
    // Permissions are typically stored in a separate field or meta-table.
    // For now, store as a JSON note on the user object if available.
    res.json({ message: 'Permissions acknowledged (no separate permissions table in DB schema)' });
};

exports.getReports = async (req, res) => {
    try {
        const { from, to } = req.query;
        const whereClause = {};
        if (from && to) {
            whereClause.NgayTao = { [Op.between]: [new Date(from), new Date(to)] };
        }

        const appointments = await Appointment.findAll({ where: whereClause });
        const payments = await ThanhToan.findAll({ where: whereClause });

        const totalRevenue = payments
            .filter(p => ['ThanhCong', 'PAID'].includes(p.TrangThai))
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

        payments.filter(p => ['ThanhCong', 'PAID'].includes(p.TrangThai)).forEach(p => {
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
        // For now, we reuse the pattern but across all specialties
        const logs = await sequelize.query(`
            SELECT nd.Ho, nd.Ten, nd.Email, ck.TenChuyenKhoa, lk.NgayDate, lk.GioBatDau, dl.TrieuChungSoBo
            FROM datlich dl
            JOIN benhnhan bn ON dl.Id_BenhNhan = bn.Id_BenhNhan
            JOIN nguoidung nd ON bn.Id_NguoiDung = nd.Id_NguoiDung
            JOIN lichkham lk ON dl.Id_LichKham = lk.Id_LichKham
            LEFT JOIN bacsi bs ON lk.Id_BacSi = bs.Id_BacSi
            LEFT JOIN chuyenkhoa ck ON bs.Id_ChuyenKhoa = ck.Id_ChuyenKhoa
            WHERE dl.TrieuChungSoBo LIKE '%AI:%'
            ORDER BY lk.NgayDate DESC
            LIMIT 50
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
        const appointments = await Appointment.findAll({
            include: [
                { 
                    model: BenhNhan, 
                    include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }] 
                },
                { 
                    model: DoctorSchedule,
                    include: [
                        { model: BacSi, include: [{ model: NguoiDung, attributes: ['Ho', 'Ten'] }] }
                    ]
                },
                { model: Clinic, as: 'Clinic', attributes: ['TenPhongKham'] }
            ],
            order: [[DoctorSchedule, 'NgayDate', 'DESC']]
        });


        const formatted = appointments.map(apt => {
            const d = apt.toJSON();
            return {
                id: d.Id_DatLich,
                MaDatLich: d.MaDatLich,
                patient_name: `${d.BenhNhan?.NguoiDung?.Ho || ''} ${d.BenhNhan?.NguoiDung?.Ten || ''}`.trim(),
                doctor_name: `${d.DoctorSchedule?.BacSi?.NguoiDung?.Ho || ''} ${d.DoctorSchedule?.BacSi?.NguoiDung?.Ten || ''}`.trim(),
                NgayKham: d.DoctorSchedule?.NgayDate || 'N/A',
                GioKham: d.DoctorSchedule?.GioBatDau || 'N/A',
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
        const { from, to, facility_id, specialty_id } = req.query;
        
        const dateFilter = {};
        if (from && to) {
            dateFilter.NgayTao = { [Op.between]: [new Date(from), new Date(to)] };
        }

        const commonWhere = { ...dateFilter };
        if (facility_id) commonWhere.Id_PhongKham = facility_id;

        // 1. User Stats
        const users = {
            total: await NguoiDung.count(),
            patients: await BenhNhan.count(),
            doctors: await BacSi.count(),
            staff: await StaffProfile.count(),
            active: await NguoiDung.count({ where: { TrangThai: 'HoatDong' } }),
            locked: await NguoiDung.count({ where: { TrangThai: 'Khoa' } })
        };

        // 2. Appointment Stats
        const appointmentWhere = { ...dateFilter };
        if (facility_id) appointmentWhere.Id_PhongKham = facility_id;
        
        const appointments = {
            total: await Appointment.count({ where: appointmentWhere }),
            pending: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['PENDING', 'ChoXacNhan'] } } }),
            confirmed: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['CONFIRMED', 'DaXacNhan'] } } }),
            completed: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['COMPLETED', 'DaKham'] } } }),
            cancelled: await Appointment.count({ where: { ...appointmentWhere, TrangThai: { [Op.in]: ['CANCELLED', 'Huy'] } } }),
            online: await Appointment.count({ 
                where: appointmentWhere,
                include: [{ model: DoctorSchedule, where: { LoaiKham: 'Online' } }]
            }),
            offline: await Appointment.count({ 
                where: appointmentWhere,
                include: [{ model: DoctorSchedule, where: { LoaiKham: 'TrucTiep' } }]
            })
        };


        // 3. Revenue Stats
        const paymentWhere = { ...dateFilter, TrangThai: 'ThanhCong' };
        if (facility_id) paymentWhere.Id_PhongKham = facility_id;
        
        const total_revenue = await ThanhToan.sum('SoTien', { where: paymentWhere }) || 0;
        
        // Revenue by period (Monthly for the last 6 months)
        const revenue_by_period = await ThanhToan.findAll({
            attributes: [
                [fn('date_format', col('NgayTao'), '%Y-%m'), 'period'],
                [fn('sum', col('SoTien')), 'revenue']
            ],
            where: { 
                TrangThai: { [Op.in]: ['ThanhCong', 'PAID'] } 
            },
            group: ['period'],
            order: [[literal('period'), 'ASC']],
            limit: 6,
            raw: true
        });



        // 4. Specialty Stats (Appointments by Specialty)
        const specialty_stats = await Appointment.findAll({
            attributes: [
                [col('LichKham.BacSi.ChuyenKhoa.TenChuyenKhoa'), 'specialty'],
                [fn('count', col('DatLich.Id_DatLich')), 'appointment_count']
            ],
            include: [
                {
                    model: DoctorSchedule,
                    attributes: [],
                    include: [{
                        model: BacSi,
                        attributes: [],
                        include: [{ model: ChuyenKhoa, attributes: [] }]
                    }]
                }
            ],
            group: ['LichKham.BacSi.ChuyenKhoa.TenChuyenKhoa'],
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
                'Id_PhongKham',
                [fn('count', col('Id_DatLich')), 'count']
            ],
            include: [{ 
                model: Clinic, 
                attributes: ['TenPhongKham'],
                as: 'Clinic' // Force alias to match our naming convention
            }],
            group: ['DatLich.Id_PhongKham', 'Clinic.Id_PhongKham', 'Clinic.TenPhongKham'],
            raw: true
        });

        const facility_stats = facility_counts.map(fc => ({
            Id_PhongKham: fc.Id_PhongKham,
            TenPhongKham: fc['Clinic.TenPhongKham'],
            count: fc.count
        }));


        // 6. AI Stats
        const ai_stats = {
            total_sessions: await AITriage.count({ where: facility_id ? { Id_PhongKham: facility_id } : {} }),
            converted_to_booking: await Appointment.count({ 
                where: { 
                    TrieuChungSoBo: { [Op.like]: '%AI:%' },
                    ...(facility_id ? { Id_PhongKham: facility_id } : {})
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
        const staffs = await StaffProfile.findAll({
            include: [
                { model: NguoiDung, attributes: ['Ho', 'Ten', 'Email', 'SoDienThoai', 'TrangThai', 'AnhDaiDien'] },
                { model: Clinic, as: 'facilities', attributes: ['TenPhongKham'] }
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


