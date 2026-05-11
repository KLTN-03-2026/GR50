const { 
  DatLich, BenhNhan, NguoiDung, PhongKham, BacSi, ChuyenKhoa,
  PatientArchiveIndex, PatientArchiveRecord,
  AIConsultationSession, AIConsultationInput, AIConsultationResult, AIReconciliation
} = require('./models');

async function seedAiArchive() {
  console.log('--- STARTING AI DATA & PATIENT ARCHIVE SEEDING ---');
  try {
    const patients = await BenhNhan.findAll({ include: [NguoiDung] });
    const clinics = await PhongKham.findAll();
    const doctors = await BacSi.findAll({ include: [NguoiDung] });
    const specialties = await ChuyenKhoa.findAll();

    console.log(`Processing for ${patients.length} patients and ${clinics.length} facilities...`);

    // 1. Update existing DatLich to have AI Diagnosis strings
    const appointments = await DatLich.findAll({ limit: 100 });
    const aiSymptoms = [
      'AI: Triệu chứng gợi ý viêm họng cấp. Khuyến cáo chuyên khoa Tai Mũi Họng.',
      'AI: Đau vùng thượng vị, nghi ngờ trào ngược dạ dày. Chuyên khoa Nội tiêu hóa.',
      'AI: Đau mỏi vai gáy kéo dài, có thể do tư thế làm việc. Chuyên khoa Chấn thương chỉnh hình.',
      'AI: Sốt cao kèm phát ban, cần theo dõi sốt xuất huyết. Chuyên khoa Truyền nhiễm.',
      'AI: Hoa mắt chóng mặt, nghi ngờ thiếu máu hoặc hạ huyết áp. Chuyên khoa Nội tổng quát.'
    ];

    for (let i = 0; i < 50; i++) {
        const apt = appointments[i];
        if (apt) {
            await apt.update({ TrieuChungSoBo: aiSymptoms[i % aiSymptoms.length] });
        }
    }
    console.log('Updated 50 appointments with AI diagnostic notes.');

    // 2. Populate AIConsultationSession & Reconciliations
    for (let i = 0; i < 30; i++) {
        const p = patients[i % patients.length];
        const f = clinics[i % clinics.length];
        const dr = doctors[i % doctors.length];
        
        const session = await AIConsultationSession.create({
            displaySessionId: `AI-202605-${1000 + i}`,
            patientId: p.Id_BenhNhan,
            facilityId: f.Id_PhongKham,
            status: 'RECONCILED_MATCHED'
        });

        await AIConsultationInput.create({
            aiSessionId: session.id,
            symptoms: 'Đau đầu, chóng mặt, buồn nôn',
            symptomDuration: '2 ngày',
            severityLevel: 'MEDIUM',
            bodyArea: 'Đầu'
        });

        await AIConsultationResult.create({
            aiSessionId: session.id,
            summary: 'Bệnh nhân có dấu hiệu rối loạn tiền đình',
            preliminarySuggestion: 'Cần khám chuyên khoa Nội thần kinh',
            confidenceScore: 0.85
        });

        await AIReconciliation.create({
            aiSessionId: session.id,
            doctorId: dr.Id_BacSi,
            facilityId: f.Id_PhongKham,
            reconciliationResult: 'MATCH_EXACT',
            doctorFinalConclusion: 'Rối loạn tiền đình cấp tính',
            isAiSuggestionUseful: true
        });
    }
    console.log('Created 30 AI Consultation sessions and reconciliations.');

    // 3. Populate Patient Archive Index & Records
    for (const p of patients) {
        for (const f of clinics) {
            const index = await PatientArchiveIndex.create({
                patientId: p.Id_BenhNhan,
                displayPatientId: p.MaBenhNhan || `BN-${p.Id_BenhNhan}`,
                facilityId: f.Id_PhongKham,
                fullName: `${p.NguoiDung.Ho} ${p.NguoiDung.Ten}`,
                phone: p.NguoiDung.SoDienThoai,
                identityNumber: `04809200${1000 + p.Id_BenhNhan}`,
                totalAppointments: 5,
                completedAppointments: 3,
                totalTransactions: 3,
                latestVisitAt: new Date(),
                status: 'ACTIVE'
            });

            // Add some records for each index
            await PatientArchiveRecord.create({
                patientId: p.Id_BenhNhan,
                facilityId: f.Id_PhongKham,
                recordType: 'APPOINTMENT',
                sourceId: 1,
                snapshotData: { date: '2026-05-10', doctor: 'Dr. Smith', diagnosis: 'Flu' }
            });
            await PatientArchiveRecord.create({
                patientId: p.Id_BenhNhan,
                facilityId: f.Id_PhongKham,
                recordType: 'MEDICAL_RECORD',
                sourceId: 1,
                snapshotData: { summary: 'Patient recovered well.', symptoms: 'Cough' }
            });
        }
    }
    console.log(`Created Archive Index for ${patients.length} patients across all ${clinics.length} facilities.`);

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('ERROR SEEDING AI/ARCHIVE:', error);
  } finally {
    process.exit();
  }
}

seedAiArchive();
