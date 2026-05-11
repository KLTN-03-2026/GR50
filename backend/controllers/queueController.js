const { AppointmentQueue, DatLich, AppointmentPriorityScore, BacSi, BenhNhan, NguoiDung, LichKham } = require('../models');
const QueueService = require('../services/QueueService');

exports.getQueue = async (req, res) => {
    try {
        const { facility_id, doctor_id, type } = req.query;
        if (!facility_id) return res.status(400).json({ detail: 'Facility ID is required' });

        // Update ranks first to ensure fresh data
        await QueueService.updateQueueRanks(facility_id, doctor_id);

        const { getQueueOrder } = require('../utils/queueLogic');
        
        const where = { facility_id, isVisible: true };
        if (doctor_id) where.doctor_id = doctor_id;

        const queue = await AppointmentQueue.findAll({
            where,
            include: [
                { 
                    model: DatLich, 
                    as: 'appointment',
                    include: [
                        { model: BenhNhan, include: [NguoiDung] },
                        { model: AppointmentPriorityScore, as: 'priorityScore' },
                        { model: LichKham, as: 'DoctorSchedule' }
                    ]
                }
            ],
            order: getQueueOrder()
        });

        const result = queue.map(q => ({
            rank: q.queueNumber, // Display ID e.g. Q-001
            appointment_id: q.appointment_id,
            code: q.appointment?.MaDatLich,
            patient_name: q.appointment?.BenhNhan?.NguoiDung ? `${q.appointment.BenhNhan.NguoiDung.Ho} ${q.appointment.BenhNhan.NguoiDung.Ten}` : 'N/A',
            type: q.appointment?.DoctorSchedule?.LoaiKham || 'TrucTiep',
            status: q.status,
            priority_score: q.priority_score,
            priority_level: q.priorityLevel,
            priority_reason: q.appointment?.priorityScore?.reason,
            entered_at: q.enteredAt,
            wait_time: Math.floor((new Date() - new Date(q.enteredAt)) / (1000 * 60))
        }));

        res.json(result);
    } catch (error) {
        console.error('getQueue error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.pushNext = async (req, res) => {
    try {
        const { id } = req.params; // appointment_id
        const apt = await DatLich.findByPk(id);
        if (!apt) return res.status(404).json({ detail: 'Appointment not found' });

        // Rule 3.4: Only push if doctor is READY
        const doctor = await BacSi.findByPk(apt.Id_BacSi);
        if (doctor.TrangThaiVanHanh !== 'AVAILABLE') {
            return res.status(400).json({ detail: 'Bác sĩ hiện không ở trạng thái sẵn sàng tiếp nhận. Vui lòng đợi bác sĩ xác nhận lượt tiếp theo.' });
        }

        // Rule 3.4: Lock push if another patient is IN_PROGRESS
        const activeApt = await DatLich.findOne({
            where: {
                Id_BacSi: apt.Id_BacSi,
                TrangThai: 'IN_PROGRESS'
            }
        });

        if (activeApt) {
            return res.status(400).json({ detail: 'Đang có bệnh nhân trong phòng khám. Không thể đẩy thêm lượt mới.' });
        }

        // Update status to IN_PROGRESS (or READY_TO_PUSH depending on flow)
        const oldStatus = apt.TrangThai;
        apt.TrangThai = 'IN_PROGRESS';
        await apt.save();

        // Update doctor status to BUSY
        doctor.TrangThaiVanHanh = 'BUSY';
        await doctor.save();

        res.json({ message: 'Đã đẩy bệnh nhân vào phòng khám thành công.', status: 'IN_PROGRESS' });
    } catch (error) {
        res.status(500).json({ detail: 'Error pushing patient' });
    }
};
