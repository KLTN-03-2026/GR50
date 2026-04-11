const { HoSoBenhAn, DatLich, BenhNhan, BacSi, NguoiDung, LichKham } = require('../models');

exports.getPatientRecords = async (req, res) => {
    try {
        const bn = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });
        if (!bn) return res.json([]);

        const records = await HoSoBenhAn.findAll({
            where: { Id_BenhNhan: bn.Id_BenhNhan },
            include: [
                { model: BacSi, include: [NguoiDung] },
                { model: DatLich, include: [LichKham] }
            ]
        });

        res.json(records.map(r => ({
            id: r.Id_HoSo,
            date: r.createdAt,
            doctor_name: `${r.BacSi.NguoiDung.Ho} ${r.BacSi.NguoiDung.Ten}`,
            diagnosis: r.ChanDoan,
            prescription: r.KeHoachDieuTri,
            Appointment: { schedule_time: r.DatLich ? r.DatLich.LichKham.NgayDate : null }
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
                { model: DatLich, include: [LichKham] }
            ]
        });

        res.json(records.map(r => ({
            id: r.Id_HoSo,
            date: r.createdAt,
            patient_name: `${r.BenhNhan.NguoiDung.Ho} ${r.BenhNhan.NguoiDung.Ten}`,
            diagnosis: r.ChanDoan,
            prescription: r.KeHoachDieuTri,
            Appointment: { schedule_time: r.DatLich ? r.DatLich.LichKham.NgayDate : null }
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

        res.json({
            id: record.Id_HoSo,
            date: record.createdAt,
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
        const { patient_id, appointment_id, diagnosis, prescription, notes } = req.body;
        
        const bs = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
        const bn = await BenhNhan.findOne({ where: { Id_NguoiDung: patient_id } });

        const record = await HoSoBenhAn.create({
            Id_BenhNhan: bn.Id_BenhNhan,
            Id_BacSi: bs.Id_BacSi,
            Id_DatLich: appointment_id,
            ChanDoan: diagnosis,
            KeHoachDieuTri: prescription,
            GhiChu: notes
        });

        res.status(201).json({ id: record.Id_HoSo });
    } catch (error) {
        res.status(500).json({ detail: 'Error' });
    }
};
