const { HoSoBenhAn, DatLich, BenhNhan, BacSi, NguoiDung, LichKham, ThongBao, PhongKham } = require('../models');

exports.getPatientRecords = async (req, res) => {
    try {
        const bn = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });
        if (!bn) return res.json([]);

        const records = await HoSoBenhAn.findAll({
            where: { Id_BenhNhan: bn.Id_BenhNhan },
            include: [
                { model: BenhNhan, include: [NguoiDung] },
                { model: BacSi, include: [NguoiDung] },
                { model: DatLich, include: [{ model: LichKham, as: 'DoctorSchedule' }] }
            ]
        });

        res.json(records.map(r => ({
            id: r.Id_HoSo,
            date: r.NgayTao,
            patient_name: `${r.BenhNhan.NguoiDung.Ho} ${r.BenhNhan.NguoiDung.Ten}`,
            diagnosis: r.ChanDoan,
            prescription: r.KeHoachDieuTri,
            notes: r.GhiChu,
            Doctor: { 
                full_name: `${r.BacSi.NguoiDung.Ho} ${r.BacSi.NguoiDung.Ten}`,
                email: r.BacSi.NguoiDung.Email 
            },
            Appointment: { schedule_time: (r.DatLich && r.DatLich.DoctorSchedule) ? r.DatLich.DoctorSchedule.NgayDate : null }
        })));
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getDoctorRecords = async (req, res) => {
    try {
        const bs = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
        if (!bs) return res.json([]);

        const records = await HoSoBenhAn.findAll({
            where: { Id_BacSi: bs.Id_BacSi },
            include: [
                { model: BenhNhan, include: [NguoiDung] },
                { model: DatLich, include: [{ model: LichKham, as: 'DoctorSchedule' }] }
            ]
        });

        res.json(records.map(r => ({
            id: r.Id_HoSo,
            date: r.NgayTao,
            patient_name: `${r.BenhNhan.NguoiDung.Ho} ${r.BenhNhan.NguoiDung.Ten}`,
            diagnosis: r.ChanDoan,
            prescription: r.KeHoachDieuTri,
            Appointment: { schedule_time: (r.DatLich && r.DatLich.DoctorSchedule) ? r.DatLich.DoctorSchedule.NgayDate : null }
        })));
    } catch (error) {
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getRecordDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await HoSoBenhAn.findByPk(id, {
            include: [
                { model: BacSi, include: [NguoiDung] },
                { model: BenhNhan, include: [NguoiDung] }
            ]
        });

        if (!record) return res.status(404).json({ detail: 'Not found' });

        // Privacy check
        if (req.user.role === 'patient') {
            const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });
            if (record.Id_BenhNhan !== patient.Id_BenhNhan) {
                return res.status(403).json({ detail: 'Bạn không có quyền xem hồ sơ này.' });
            }
        } else if (req.user.role === 'doctor') {
            const doctor = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
            if (!doctor || record.Id_BacSi !== doctor.Id_BacSi) {
                return res.status(403).json({ detail: 'Bạn không có quyền xem hồ sơ này.' });
            }
        }

        res.json({
            id: record.Id_HoSo,
            date: record.NgayTao,
            diagnosis: record.ChanDoan,
            prescription: record.KeHoachDieuTri,
            notes: record.GhiChu,
            file_url: null,
            Doctor: { full_name: `${record.BacSi.NguoiDung.Ho} ${record.BacSi.NguoiDung.Ten}`, email: record.BacSi.NguoiDung.Email },
            Patient: { full_name: `${record.BenhNhan.NguoiDung.Ho} ${record.BenhNhan.NguoiDung.Ten}`, email: record.BenhNhan.NguoiDung.Email }
        });
    } catch (error) {
        res.status(500).json({ detail: 'Error' });
    }
};

exports.createRecord = async (req, res) => {
    try {
        const { appointment_id, diagnosis, prescription, notes } = req.body;

        const bs = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
        if (!bs) return res.status(403).json({ detail: 'Doctor profile required.' });

        const appointment = await DatLich.findOne({
            where: { Id_DatLich: appointment_id },
            include: [{ model: LichKham, as: 'DoctorSchedule' }]
        });

        if (!appointment) return res.status(404).json({ detail: 'Appointment not found.' });

        // Ownership check
        if (appointment.DoctorSchedule.Id_BacSi !== bs.Id_BacSi) {
            return res.status(403).json({ detail: 'Bạn không có quyền tạo hồ sơ cho lịch hẹn này.' });
        }

        const record = await HoSoBenhAn.create({
            Id_BenhNhan: appointment.Id_BenhNhan,
            Id_BacSi: bs.Id_BacSi,
            Id_DatLich: appointment_id,
            ChanDoan: diagnosis,
            KeHoachDieuTri: prescription,
            GhiChu: notes
        });

        res.status(201).json({ id: record.Id_HoSo });
    } catch (error) {
        console.error('Create record error:', error);
        res.status(500).json({ detail: 'Error' });
    }
};

exports.createFollowUpAppointment = async (req, res) => {
    try {
        const { id } = req.params; // Medical Record ID
        const { appointment_date, appointment_time, appointment_type, symptoms, notes, facility_id } = req.body;

        const record = await HoSoBenhAn.findByPk(id);
        if (!record) return res.status(404).json({ detail: 'Medical record not found.' });

        const bs = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
        if (!bs || record.Id_BacSi !== bs.Id_BacSi) {
            return res.status(403).json({ detail: 'Bạn không có quyền đặt lịch tái khám cho hồ sơ này.' });
        }

        // Logic similar to appointmentController.create
        const dbLoaiKham = appointment_type === 'online' ? 'Online' : 'TrucTiep';
        
        let lichKham = await LichKham.findOne({
            where: {
                Id_BacSi: bs.Id_BacSi,
                Id_PhongKham: facility_id || record.Id_PhongKham,
                NgayDate: appointment_date,
                GioBatDau: appointment_time,
                LoaiKham: dbLoaiKham
            }
        });

        if (lichKham) {
            if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) {
                return res.status(400).json({ detail: 'Khung giờ này đã đủ số lượng bệnh nhân tối đa.' });
            }
            lichKham.SoLuongDaDat += 1;
            await lichKham.save();
        } else {
            lichKham = await LichKham.create({
                Id_BacSi: bs.Id_BacSi,
                Id_PhongKham: facility_id || record.Id_PhongKham,
                NgayDate: appointment_date,
                GioBatDau: appointment_time,
                GioKetThuc: appointment_time,
                LoaiKham: dbLoaiKham,
                TrangThai: 'Mo',
                SoLuongToiDa: bs.SoLuongKhachMacDinh || 10,
                SoLuongDaDat: 1
            });
        }

        const appointment = await DatLich.create({
            MaDatLich: `TK${Date.now()}`,
            Id_BenhNhan: record.Id_BenhNhan,
            Id_LichKham: lichKham.Id_LichKham,
            Id_PhongKham: facility_id || record.Id_PhongKham,
            Id_BacSi: bs.Id_BacSi,
            TrangThai: 'CONFIRMED', // Follow-ups are usually pre-confirmed by the doctor
            TrieuChungSoBo: symptoms || 'Tái khám theo chỉ định',
            GhiChu: notes,
            GiaTien: bs.PhiTuVan,
            ThoiDiemDat: new Date(),
            IsFollowUp: true,
            TriggeringMedicalRecordId: id
        });

        // Create reminders (Automatic Reminders)
        const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
        
        // Reminder 1: 24h before
        const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
        if (reminder24h > new Date()) {
            await ThongBao.create({
                Id_NguoiDung: record.Id_BenhNhan,
                NoiDung: `Nhắc lịch tái khám: Bạn có lịch hẹn vào lúc ${appointment_time} ngày ${appointment_date}. Vui lòng chuẩn bị các giấy tờ cần thiết.`,
                Loai: 'REMINDER',
                Id_DatLich: appointment.Id_DatLich,
                ScheduledAt: reminder24h,
                Status: 'PENDING'
            });
        }

        // Reminder 2: 2h before
        const reminder2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
        if (reminder2h > new Date()) {
            await ThongBao.create({
                Id_NguoiDung: record.Id_BenhNhan,
                NoiDung: `Nhắc lịch: Bạn có lịch tái khám sau 2 giờ nữa (${appointment_time}). Vui lòng đến đúng giờ.`,
                Loai: 'REMINDER',
                Id_DatLich: appointment.Id_DatLich,
                ScheduledAt: reminder2h,
                Status: 'PENDING'
            });
        }

        // Initial confirmation notification
        await ThongBao.create({
            Id_NguoiDung: record.Id_BenhNhan,
            NoiDung: `Bác sĩ đã đặt lịch tái khám cho bạn vào lúc ${appointment_time} ngày ${appointment_date}.`,
            Loai: 'HE_THONG',
            Id_DatLich: appointment.Id_DatLich,
            Status: 'SENT',
            SentAt: new Date()
        });

        res.status(201).json({ 
            id: appointment.Id_DatLich, 
            message: 'Lịch tái khám đã được tạo và thông báo nhắc lịch đã được thiết lập.' 
        });

    } catch (error) {
        console.error('Create follow-up error:', error);
        res.status(500).json({ detail: 'Error' });
    }
};
