const { DatLich, AppointmentPriorityScore, AppointmentQueue, AITuVanPhien, ThanhToan, BenhNhan, NguoiDung } = require('../models');
const { Op } = require('sequelize');

class QueueService {
    /**
     * Calculate priority score for an appointment based on PB 2.0 rules.
     * Score = triage + service_type + special_object + wait_time + verification
     */
    async calculatePriority(appointmentId) {
        const apt = await DatLich.findByPk(appointmentId, {
            include: [
                { model: BenhNhan, include: [NguoiDung] },
                { model: ThanhToan }
            ]
        });

        if (!apt) return null;

        let triageScore = 0;
        let serviceScore = 0;
        let specialScore = 0;
        let waitScore = 0;
        let verifyScore = 0;
        let reason = [];

        // 1. Triage Score (0-40)
        // Check if there's an AI Diagnosis for this patient recently
        const aiSession = await AITuVanPhien.findOne({
            where: { Id_NguoiDung: apt.BenhNhan.Id_NguoiDung },
            order: [['NgayTao', 'DESC']]
        });

        if (aiSession) {
            if (aiSession.MucDoUuTien === 'KhanCap') {
                triageScore = 40;
                reason.push('AI Triage: Khẩn cấp');
            } else if (aiSession.MucDoUuTien === 'Cao') {
                triageScore = 25;
                reason.push('AI Triage: Cao');
            } else if (aiSession.MucDoUuTien === 'TrungBinh') {
                triageScore = 10;
                reason.push('AI Triage: Trung bình');
            }
        }

        // 2. Special Object (0-15)
        const user = apt.BenhNhan.NguoiDung;
        if (user.NgaySinh) {
            const age = new Date().getFullYear() - new Date(user.NgaySinh).getFullYear();
            if (age >= 65) {
                specialScore = 15;
                reason.push('Đối tượng đặc biệt: Người cao tuổi');
            } else if (age <= 6) {
                specialScore = 10;
                reason.push('Đối tượng đặc biệt: Trẻ em');
            }
        }

        // 3. Wait Time (0-20)
        const waitMinutes = (new Date() - new Date(apt.NgayTao)) / (1000 * 60);
        waitScore = Math.min(20, Math.floor(waitMinutes / 10)); // 1 point per 10 mins, max 20
        if (waitScore > 0) reason.push(`Thời gian chờ: ${Math.floor(waitMinutes)} phút`);

        // 4. Verification/Payment (0-10)
        if (apt.ThanhToan && (apt.ThanhToan.TrangThai === 'PAID' || apt.ThanhToan.TrangThai === 'ThanhCong')) {
            verifyScore = 10;
            reason.push('Đã hoàn tất thanh toán/xác thực');
        }

        const totalScore = triageScore + serviceScore + specialScore + waitScore + verifyScore;

        let level = 'LOW';
        if (totalScore >= 60) level = 'URGENT';
        else if (totalScore >= 40) level = 'HIGH';
        else if (totalScore >= 20) level = 'MEDIUM';

        // Update or Create Score record
        const [scoreRecord] = await AppointmentPriorityScore.upsert({
            appointment_id: appointmentId,
            triage_score: triageScore,
            service_score: serviceScore,
            special_object_score: specialScore,
            wait_time_score: waitScore,
            verification_score: verifyScore,
            total_score: totalScore,
            priority_level: level,
            reason: reason.join(', ')
        });

        return { totalScore, level, reason: reason.join(', ') };
    }

    async updateQueueRanks(facilityId, doctorId = null) {
        const { getNextSequence } = require('../utils/sequenceHelper');
        
        const where = { 
            Id_PhongKham: facilityId,
            TrangThai: ['CHECKED_IN', 'IN_QUEUE', 'WAITING_CONFIRMATION', 'PENDING'],
            isVisible: true
        };
        if (doctorId) where.Id_BacSi = doctorId;

        const appointments = await DatLich.findAll({
            where,
            include: [{ model: AppointmentPriorityScore, as: 'priorityScore' }],
            order: [
                // Priority Level (URGENT > HIGH > MEDIUM > LOW), then Total Score DESC, then Date ASC
            ]
        });

        const levelMap = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        
        appointments.sort((a, b) => {
            const levelA = levelMap[a.priorityScore?.priority_level || 'LOW'];
            const levelB = levelMap[b.priorityScore?.priority_level || 'LOW'];
            if (levelA !== levelB) return levelB - levelA;
            
            const scoreA = a.priorityScore?.total_score || 0;
            const scoreB = b.priorityScore?.total_score || 0;
            if (scoreA !== scoreB) return scoreB - scoreA;

            return new Date(a.enteredAt || a.NgayTao) - new Date(b.enteredAt || b.NgayTao);
        });

        // Update ranks in AppointmentQueue
        for (let i = 0; i < appointments.length; i++) {
            const apt = appointments[i];
            const seq = await getNextSequence(facilityId, 'QUEUE');

            await AppointmentQueue.upsert({
                appointment_id: apt.Id_DatLich,
                facility_id: apt.Id_PhongKham,
                doctor_id: apt.Id_BacSi,
                queueNumber: seq.displayId,
                priority_score: apt.priorityScore?.total_score || 0,
                priorityLevel: apt.priorityScore?.priority_level || 'NORMAL',
                status: 'WAITING',
                enteredAt: apt.enteredAt || new Date(),
                isVisible: true
            });
            
            // Update DatLich for backward compatibility/quick STT access
            apt.STT_HangCho = i + 1;
            await apt.save();
        }
    }
}

module.exports = new QueueService();
