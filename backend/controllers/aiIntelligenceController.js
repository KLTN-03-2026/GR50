const { 
    AIConsultationSession, 
    AIConsultationInput, 
    AIConsultationResult, 
    AISuggestedSpecialty, 
    AISuggestedDoctor, 
    AIReconciliation,
    BenhNhan,
    NguoiDung,
    ChuyenKhoa,
    PhongKham,
    BacSi,
    DatLich,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

exports.submitConsultation = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            symptoms, symptomDuration, severityLevel, 
            bodyArea, medicalHistoryText, preferredVisitType, 
            preferredFacilityId 
        } = req.body;
        
        const patientId = req.user.role === 'patient' ? (await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } }))?.Id_BenhNhan : null;

        // 1. Create Session
        const session = await AIConsultationSession.create({
            displaySessionId: `AI-${Date.now()}`,
            patientId: patientId,
            guestId: !patientId ? `GUEST-${Date.now()}` : null,
            source: 'WEB'
        }, { transaction: t });

        // 2. Save Input
        await AIConsultationInput.create({
            aiSessionId: session.id,
            symptoms,
            symptomDuration,
            severityLevel,
            bodyArea,
            medicalHistoryText,
            preferredVisitType,
            preferredFacilityId
        }, { transaction: t });

        // 3. Mock AI Analysis (Replace with actual AI call in production)
        const summary = `Bệnh nhân có triệu chứng ${symptoms} tại vùng ${bodyArea || 'toàn thân'} trong ${symptomDuration || 'vài ngày'}.`;
        const preliminarySuggestion = `Dựa trên triệu chứng ${symptoms}, bạn nên khám chuyên khoa Nội tổng quát hoặc Chuyên khoa phù hợp với vị trí ${bodyArea}.`;
        
        const aiResult = await AIConsultationResult.create({
            aiSessionId: session.id,
            summary,
            preliminarySuggestion,
            priorityLevel: severityLevel === 'URGENT' ? 'URGENT' : (severityLevel === 'HIGH' ? 'PRIORITY' : 'NORMAL'),
            confidenceScore: 0.85,
            disclaimer: "Kết quả AI chỉ mang tính chất tham khảo, hỗ trợ gợi ý chuyên khoa, bác sĩ và cơ sở y tế phù hợp. Kết quả này không thay thế chẩn đoán chuyên môn của bác sĩ.",
            rawAiResponse: { analysis: 'mock' }
        }, { transaction: t });

        // 4. Find Matching Specialty & Doctors
        const specialties = await ChuyenKhoa.findAll({ limit: 2 });
        for (let i = 0; i < specialties.length; i++) {
            await AISuggestedSpecialty.create({
                aiSessionId: session.id,
                specialtyId: specialties[i].Id_ChuyenKhoa,
                specialtyName: specialties[i].TenChuyenKhoa,
                rank: i + 1,
                confidenceScore: 0.9 - (i * 0.2),
                reason: `Phù hợp với triệu chứng tại vùng ${bodyArea}`
            }, { transaction: t });
            
            // Find one doctor per specialty
            const doctor = await BacSi.findOne({ 
                where: { Id_ChuyenKhoa: specialties[i].Id_ChuyenKhoa, TrangThai: 'HoatDong' },
                include: [{ model: NguoiDung }]
            });
            if (doctor) {
                await AISuggestedDoctor.create({
                    aiSessionId: session.id,
                    doctorId: doctor.Id_BacSi,
                    doctorName: `${doctor.NguoiDung.Ho} ${doctor.NguoiDung.Ten}`,
                    facilityId: preferredFacilityId || 1, // Fallback
                    rank: i + 1,
                    reason: `Bác sĩ có kinh nghiệm trong chuyên khoa ${specialties[i].TenChuyenKhoa}`
                }, { transaction: t });
            }
        }

        await t.commit();
        
        // Fetch detailed result for response
        const fullResult = await AIConsultationSession.findByPk(session.id, {
            include: [
                { model: AIConsultationResult },
                { model: AISuggestedSpecialty, as: 'suggestedSpecialties' },
                { model: AISuggestedDoctor, as: 'suggestedDoctors' }
            ]
        });

        res.status(201).json(fullResult);
    } catch (error) {
        if (t) await t.rollback();
        console.error('submitConsultation error:', error);
        res.status(500).json({ detail: 'Lỗi xử lý tư vấn AI' });
    }
};

exports.getRecentConsultations = async (req, res) => {
    try {
        const { facilityId, doctorId, status } = req.query;
        const whereClause = {};
        
        // Dynamic Facility Filtering based on role
        if (req.user.role === 'patient') {
            const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });
            if (!patient) return res.json([]);
            whereClause.patientId = patient.Id_BenhNhan;
        } else if (req.user.role === 'admin' || req.user.role === 'staff') {
            const targetPatientId = req.query.patientId;
            if (targetPatientId) whereClause.patientId = targetPatientId;
            
            const effectiveFacilityId = req.user.facility_id || req.query.facilityId;
            if (effectiveFacilityId) whereClause.facilityId = effectiveFacilityId;
        } else if (req.user.role === 'doctor') {
            const doctor = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
            if (!doctor) return res.json([]);

            if (req.user.facility_id) whereClause.facilityId = req.user.facility_id;
            
            // Doctors see:
            // 1. Sessions where they are suggested
            // 2. Sessions assigned to their appointments
            whereClause[Op.or] = [
                { '$suggestedDoctors.doctorId$': doctor.Id_BacSi },
                { '$DatLich.Id_BacSi$': doctor.Id_BacSi }
            ];
        }
        
        if (status) whereClause.status = status;


        const includes = [
            { 
                model: BenhNhan, 
                include: [{ model: NguoiDung, attributes: ['Ho', 'Ten', 'SoDienThoai'] }] 
            },
            { model: AIConsultationInput },
            { model: AIConsultationResult },
            { model: AISuggestedSpecialty, as: 'suggestedSpecialties', limit: 1 },
            { 
                model: AISuggestedDoctor, 
                as: 'suggestedDoctors',
                required: false
            },
            {
                model: DatLich,
                required: false
            }
        ];

        // Filtering moved to whereClause above

        const sessions = await AIConsultationSession.findAll({
            where: whereClause,
            include: includes,
            order: [['createdAt', 'DESC']],
            limit: 50,
            subQuery: false
        });

        res.json(sessions.map(s => ({
            id: s.id,
            displaySessionId: s.displaySessionId,
            createdAt: s.createdAt,
            patientName: s.BenhNhan ? `${s.BenhNhan.NguoiDung?.Ho || ''} ${s.BenhNhan.NguoiDung?.Ten || ''}`.trim() : 'Khách vãng lai',
            patientCode: s.BenhNhan ? `PAT-${s.BenhNhan.Id_BenhNhan}` : (s.guestId || 'N/A'),
            symptoms: s.AIConsultationInput?.symptoms || 'Không có mô tả',
            aiSummary: s.AIConsultationResult?.summary || 'Chưa có tóm tắt',
            suggestedSpecialty: s.suggestedSpecialties?.[0]?.specialtyName || 'Đang phân tích',
            status: s.status
        })));
    } catch (error) {
        console.error('getRecentConsultations detailed error:', error);
        res.status(500).json({ 
            detail: 'Lỗi khi lấy danh sách AI',
            error: error.message 
        });
    }
};

exports.reconcile = async (req, res) => {
    try {
        const { aiSessionId } = req.params;
        const { 
            appointmentId, reconciliationResult, 
            doctorSymptomsObserved, preliminaryDiagnosis,
            doctorFinalConclusion, doctorDiagnosisSummary,
            doctorSpecialtyId, testOrders, priorityLevelActual,
            isAiSuggestionUseful, inputToMedicalRecord,
            doctorNote, trainingCandidate
        } = req.body;

        // Support finding by both primary key (integer) and displaySessionId (string)
        const session = await AIConsultationSession.findOne({
            where: {
                [Op.or]: [
                    { id: isNaN(aiSessionId) ? -1 : parseInt(aiSessionId) },
                    { displaySessionId: aiSessionId }
                ]
            },
            include: [{ model: DatLich }]
        });

        if (!session) return res.status(404).json({ detail: 'Không tìm thấy phiên AI phù hợp với ID: ' + aiSessionId });

        // Correctly identify Doctor ID (BacSi.Id_BacSi)
        let doctorId = null;
        let doctorProfile = null;
        if (req.user.role === 'doctor') {
            doctorProfile = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
            doctorId = doctorProfile ? doctorProfile.Id_BacSi : null;
        }

        if (!doctorId && req.user.role === 'doctor') {
            return res.status(400).json({ detail: 'Không tìm thấy hồ sơ bác sĩ của bạn để thực hiện đối soát.' });
        }

        // Use appointmentId from body or from session link
        const effectiveAppointmentId = appointmentId || (session.DatLich ? session.DatLich.Id_DatLich : null);
        
        // Resolve Facility ID: Session -> Appointment -> Doctor Profile -> Default 1
        let effectiveFacilityId = session.facilityId || (session.DatLich ? session.DatLich.Id_PhongKham : null);
        if (!effectiveFacilityId && doctorProfile) {
            // Get first facility if available
            const facilities = await doctorProfile.getFacilities();
            if (facilities && facilities.length > 0) effectiveFacilityId = facilities[0].Id_PhongKham;
        }
        if (!effectiveFacilityId) effectiveFacilityId = 1; // absolute fallback

        // Check if reconciliation already exists
        const existing = await AIReconciliation.findOne({ where: { aiSessionId: session.id } });
        
        const reconciliationData = {
            aiSessionId: session.id,
            appointmentId: effectiveAppointmentId,
            doctorId: doctorId, // Must be Id_BacSi
            facilityId: effectiveFacilityId,
            reconciliationResult,
            doctorSymptomsObserved: doctorSymptomsObserved || '',
            preliminaryDiagnosis: preliminaryDiagnosis || '',
            doctorFinalConclusion: doctorFinalConclusion || '',
            doctorDiagnosisSummary: doctorDiagnosisSummary || '',
            doctorSpecialtyId: doctorSpecialtyId || (doctorProfile ? doctorProfile.Id_ChuyenKhoa : null),
            testOrders: testOrders || '',
            priorityLevelActual: priorityLevelActual || 'NORMAL',
            isAiSuggestionUseful: isAiSuggestionUseful !== undefined ? isAiSuggestionUseful : (reconciliationResult !== 'MISMATCH'),
            inputToMedicalRecord: !!inputToMedicalRecord,
            doctorNote: doctorNote || doctorFinalConclusion || '',
            trainingCandidate: trainingCandidate !== undefined ? trainingCandidate : true
        };

        let reconciliation;
        if (existing) {
            reconciliation = await existing.update(reconciliationData);
        } else {
            reconciliation = await AIReconciliation.create(reconciliationData);
        }

        // Update session status
        let status = 'RECONCILED_MATCHED';
        if (reconciliationResult === 'MISMATCH') status = 'RECONCILED_MISMATCH';
        else if (reconciliationResult === 'MATCH_PARTIAL') status = 'RECONCILED_PARTIAL';
        else if (reconciliationResult === 'MATCH_EXACT') status = 'RECONCILED_MATCHED';
        
        await session.update({ status });

        res.json({ message: 'Đã hoàn thành đối soát AI', status, reconciliation });
    } catch (error) {
        console.error('Reconcile error details:', error);
        res.status(500).json({ 
            detail: 'Lỗi hệ thống khi thực hiện đối soát AI',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.approve = async (req, res) => {
    try {
        const { aiSessionId } = req.params;
        const session = await AIConsultationSession.findByPk(aiSessionId);
        if (!session) return res.status(404).json({ detail: 'Không tìm thấy phiên AI' });

        // Update status to waiting for doctor review
        await session.update({ status: 'WAITING_DOCTOR_REVIEW' });

        res.json({ 
            message: 'Đã phê duyệt và chuyển thông tin cho bác sĩ chuyên khoa.', 
            status: 'WAITING_DOCTOR_REVIEW' 
        });
    } catch (error) {
        console.error('Approve AI session error:', error);
        res.status(500).json({ detail: 'Lỗi hệ thống khi phê duyệt phiên AI' });
    }
};
