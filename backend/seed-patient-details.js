const { 
  DatLich, BenhNhan, NguoiDung, PhongKham, BacSi, ChuyenKhoa,
  PatientArchiveIndex, PatientArchiveRecord,
  AIConsultationSession, AIConsultationInput, AIConsultationResult, AIReconciliation
} = require('./models');

async function seedPatientDetails() {
  console.log('--- STARTING DETAILED PATIENT ARCHIVE SEEDING ---');
  try {
    const patients = await BenhNhan.findAll({ 
        include: [NguoiDung],
        limit: 10 // Let's focus on a few patients to make them very rich
    });
    const clinics = await PhongKham.findAll();
    const doctors = await BacSi.findAll({ include: [NguoiDung] });
    
    // Clear existing archive data to start fresh for these patients
    const patientIds = patients.map(p => p.Id_BenhNhan);
    await PatientArchiveIndex.destroy({ where: { patientId: patientIds } });
    await PatientArchiveRecord.destroy({ where: { patientId: patientIds } });

    for (const p of patients) {
        for (const f of clinics) {
            console.log(`Seeding details for ${p.NguoiDung.Ho} ${p.NguoiDung.Ten} at ${f.TenPhongKham}...`);
            
            await PatientArchiveIndex.create({
                patientId: p.Id_BenhNhan,
                displayPatientId: `PAT-${p.Id_BenhNhan.toString().padStart(4, '0')}`,
                facilityId: f.Id_PhongKham,
                fullName: `${p.NguoiDung.Ho} ${p.NguoiDung.Ten}`,
                phone: p.NguoiDung.SoDienThoai,
                identityNumber: `04809200${1000 + p.Id_BenhNhan}`,
                totalAppointments: 8,
                completedAppointments: 5,
                totalTransactions: 5,
                latestVisitAt: new Date(),
                status: 'ACTIVE'
            });

            // 1. Appointments
            for (let i = 0; i < 5; i++) {
                const dr = doctors[i % doctors.length];
                await PatientArchiveRecord.create({
                    patientId: p.Id_BenhNhan,
                    facilityId: f.Id_PhongKham,
                    recordType: 'APPOINTMENT',
                    sourceId: 100 + i,
                    snapshotData: {
                        MaDatLich: `DL-${10000 + i + p.Id_BenhNhan * 100}`,
                        ThoiDiemDat: new Date(Date.now() - i * 86400000 * 3).toISOString(),
                        TrangThai: i % 4 === 0 ? 'COMPLETED' : 'DaKham',
                        GiaTien: 150000 + i * 50000,
                        BacSi: {
                            NguoiDung: { HoTen: `${dr.NguoiDung.Ho} ${dr.NguoiDung.Ten}` }
                        }
                    }
                });
            }

            // 2. Medical Records
            const diagnoses = ['Viêm họng cấp', 'Rối loạn tiêu hóa', 'Viêm loét dạ dày', 'Cảm cúm', 'Sốt siêu vi'];
            const treatments = ['Súc miệng nước muối, uống kháng sinh', 'Ăn đồ mềm, uống men tiêu hóa', 'Uống thuốc kháng acid, kiêng đồ cay', 'Nghỉ ngơi, uống nhiều nước', 'Hạ sốt, bổ sung vitamin C'];
            
            for (let i = 0; i < 5; i++) {
                await PatientArchiveRecord.create({
                    patientId: p.Id_BenhNhan,
                    facilityId: f.Id_PhongKham,
                    recordType: 'MEDICAL_RECORD',
                    sourceId: 200 + i,
                    snapshotData: {
                        ChanDoan: diagnoses[i % diagnoses.length],
                        KeHoachDieuTri: treatments[i % treatments.length],
                        GhiChu: 'Bệnh nhân cần tái khám sau 7 ngày.'
                    },
                    archivedAt: new Date(Date.now() - i * 86400000 * 3),
                    archivedBy: 'Bác sĩ Hệ thống'
                });
            }

            // 3. Payments
            for (let i = 0; i < 5; i++) {
                await PatientArchiveRecord.create({
                    patientId: p.Id_BenhNhan,
                    facilityId: f.Id_PhongKham,
                    recordType: 'PAYMENT',
                    sourceId: 300 + i,
                    snapshotData: {
                        MaGiaoDich: `TRANS-${Date.now()}-${i}`,
                        ThoiDiemThanhToan: new Date(Date.now() - i * 86400000 * 3).toISOString(),
                        SoTien: 200000 + i * 50000,
                        PhuongThuc: i % 2 === 0 ? 'VNPay' : 'TienMat',
                        TrangThai: 'PAID'
                    }
                });
            }

            // 4. Cancellations
            await PatientArchiveRecord.create({
                patientId: p.Id_BenhNhan,
                facilityId: f.Id_PhongKham,
                recordType: 'CANCELLATION',
                sourceId: 400,
                snapshotData: {
                    receiptCode: `CANCEL-${p.Id_BenhNhan}-001`,
                    reason: 'Bận việc đột xuất',
                    cancelTime: new Date(Date.now() - 15 * 86400000).toISOString(),
                    originalFee: 200000,
                    penaltyAmount: 50000
                }
            });
        }
    }

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('ERROR SEEDING PATIENT DETAILS:', error);
  } finally {
    process.exit();
  }
}

seedPatientDetails();
