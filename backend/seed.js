const bcrypt = require('bcryptjs');
const {
  sequelize, VaiTro, NguoiDung, NguoiDung_VaiTro, ChuyenKhoa, BacSi, BenhNhan,
  PhongKham, LichKham, StaffProfile, Staff_Facility, DatLich,
  HoSoBenhAn, DonThuoc, ChiTietDonThuoc, DanhGia, HoaDon, ThanhToan,
  Conversation, Message, AITuVanPhien, ThongBao
} = require('./models');

async function seed() {
  console.log('--- STARTING COMPREHENSIVE PRODUCTION-READY SEEDING ---');

  try {
    // 0. Reset Database
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('>> Database reset successful.');

    const hashedPassword = await bcrypt.hash('12345678', 10);

    // 1. Roles
    const roles = await VaiTro.bulkCreate([
      { MaVaiTro: 'admin', TenVaiTro: 'Quản trị viên' },
      { MaVaiTro: 'doctor', TenVaiTro: 'Bác sĩ' },
      { MaVaiTro: 'patient', TenVaiTro: 'Bệnh nhân' },
      { MaVaiTro: 'staff', TenVaiTro: 'Nhân viên / Lễ tân' }
    ]);
    const roleMap = roles.reduce((acc, r) => ({ ...acc, [r.MaVaiTro]: r.Id_VaiTro }), {});

    // 2. Specialties (10 Real Specialties)
    const specialties = await ChuyenKhoa.bulkCreate([
      { TenChuyenKhoa: 'Nội Tổng Quát', MoTa: 'Khám và điều trị các bệnh lý nội khoa chung.' },
      { TenChuyenKhoa: 'Tim Mạch', MoTa: 'Chẩn đoán và điều trị bệnh lý tim, mạch máu và tăng huyết áp.' },
      { TenChuyenKhoa: 'Thần Kinh', MoTa: 'Chẩn đoán và điều trị các bệnh lý liên quan đến não và hệ thần kinh.' },
      { TenChuyenKhoa: 'Cơ Xương Khớp', MoTa: 'Điều trị các bệnh về hệ vận động, xương, khớp và cơ.' },
      { TenChuyenKhoa: 'Nhi Khoa', MoTa: 'Chăm sóc sức khỏe và điều trị bệnh cho trẻ em.' },
      { TenChuyenKhoa: 'Sản Phụ Khoa', MoTa: 'Chăm sóc sức khỏe phụ nữ, thai sản và phụ khoa.' },
      { TenChuyenKhoa: 'Tai Mũi Họng', MoTa: 'Khám và điều trị các bệnh về tai, mũi, họng.' },
      { TenChuyenKhoa: 'Da Liễu', MoTa: 'Điều trị các bệnh về da, tóc và móng.' },
      { TenChuyenKhoa: 'Tiêu Hóa', MoTa: 'Khám và điều trị các bệnh về đường tiêu hóa.' },
      { TenChuyenKhoa: 'Mắt', MoTa: 'Chăm sóc thị lực và điều trị các bệnh về mắt.' }
    ]);

    // 3. Clinics (5 Major Hospitals)
    const clinics = await PhongKham.bulkCreate([
      { TenPhongKham: 'Bệnh viện Bạch Mai (Hà Nội)', DiaChi: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội', SoDienThoai: '024.3869.3731', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện Chợ Rẫy (TP.HCM)', DiaChi: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM', SoDienThoai: '028.3855.4137', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện Đa khoa Đà Nẵng', DiaChi: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng', SoDienThoai: '0236.3821.118', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện Trung ương Huế', DiaChi: '16 Lê Lợi, Vĩnh Ninh, Thành phố Huế', SoDienThoai: '0234.3822.325', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện Đa khoa Cần Thơ', DiaChi: '315 Nguyễn Văn Linh, An Khánh, Ninh Kiều, Cần Thơ', SoDienThoai: '0292.3821.235', TrangThai: 'HoatDong' }
    ]);

    // 4. Admin
    const admin = await NguoiDung.create({ Ho: 'Hệ Thống', Ten: 'Admin', Email: 'admin@medischedule.com', MatKhau: hashedPassword });
    await NguoiDung_VaiTro.create({ Id_NguoiDung: admin.Id_NguoiDung, Id_VaiTro: roleMap['admin'] });

    // 5. Staff (1 per clinic)
    const staffNames = [['Nguyễn', 'Thị Mai'], ['Lê', 'Hoàng Nam'], ['Phạm', 'Minh Tuấn'], ['Trần', 'Thu Thủy'], ['Hoàng', 'Văn Đức']];
    const createdStaff = [];
    for (let i = 0; i < 5; i++) {
      const user = await NguoiDung.create({ Ho: staffNames[i][0], Ten: staffNames[i][1], Email: `staff${i+1}@medischedule.com`, MatKhau: hashedPassword });
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: roleMap['staff'] });
      const profile = await StaffProfile.create({ user_id: user.Id_NguoiDung, employee_code: `EMP00${i+1}`, status: 'active' });
      await Staff_Facility.create({ staff_id: profile.id, facility_id: clinics[i].Id_PhongKham, is_active: true, can_reception: true, can_payment: true });
      createdStaff.push(profile);
    }

    // 6. Doctors (20 Doctors)
    const doctorFirstNames = ['Hùng', 'Dũng', 'Cường', 'Anh', 'Minh', 'Thắng', 'Sơn', 'Tùng', 'Hà', 'Lan', 'Hương', 'Hạnh', 'Tuấn', 'Lâm', 'Hải', 'Nam', 'Quang', 'Trang', 'Tuyết', 'Mai'];
    const doctorLastNames = ['Nguyễn', 'Lê', 'Phạm', 'Trần', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ'];
    const createdDoctors = [];
    for (let i = 0; i < 20; i++) {
      const ho = doctorLastNames[i % 10];
      const ten = doctorFirstNames[i];
      const email = `doctor${i+1}@medischedule.com`;
      const user = await NguoiDung.create({ Ho: ho, Ten: ten, Email: email, MatKhau: hashedPassword });
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: roleMap['doctor'] });
      
      const doctor = await BacSi.create({
        Id_NguoiDung: user.Id_NguoiDung,
        Id_ChuyenKhoa: specialties[i % 10].Id_ChuyenKhoa,
        PhiTuVan: 200000 + (Math.floor(Math.random() * 10) * 50000),
        SoNamKinhNghiem: 5 + Math.floor(Math.random() * 25),
        TrangThai: 'HoatDong'
      });
      createdDoctors.push(doctor);

      // Link to 1-2 clinics
      const cIdx = i % 5;
      await sequelize.query(`INSERT INTO bacsi_phongkham (doctor_id, facility_id) VALUES (${doctor.Id_BacSi}, ${clinics[cIdx].Id_PhongKham})`);
      if (i % 3 === 0) {
        await sequelize.query(`INSERT INTO bacsi_phongkham (doctor_id, facility_id) VALUES (${doctor.Id_BacSi}, ${clinics[(cIdx+1)%5].Id_PhongKham})`);
      }
    }

    // 7. Patients (10 Patients)
    const patientFirstNames = ['An', 'Bình', 'Chi', 'Dương', 'Em', 'Giang', 'Hoa', 'Hùng', 'Kiên', 'Liên'];
    const createdPatients = [];
    for (let i = 0; i < 10; i++) {
      const ho = doctorLastNames[9 - (i % 10)];
      const ten = patientFirstNames[i];
      const user = await NguoiDung.create({ Ho: ho, Ten: ten, Email: `patient${i+1}@gmail.com`, MatKhau: hashedPassword });
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: roleMap['patient'] });
      const patient = await BenhNhan.create({ Id_NguoiDung: user.Id_NguoiDung, MaBenhNhan: `BN${1000 + i}` });
      createdPatients.push(patient);
    }

    // 8. Historical Data (Past 14 days)
    console.log('>> Generating historical records...');
    const now = new Date();
    for (let d = 1; d <= 14; d++) {
      const pastDate = new Date(now.getTime() - d * 86400000);
      const dateStr = pastDate.toISOString().split('T')[0];

      for (let j = 0; j < 5; j++) { // 5 appointments per day
        const doctor = createdDoctors[Math.floor(Math.random() * 20)];
        const patient = createdPatients[Math.floor(Math.random() * 10)];
        const clinic = clinics[Math.floor(Math.random() * 5)];

        const schedule = await LichKham.create({
          Id_BacSi: doctor.Id_BacSi, Id_PhongKham: clinic.Id_PhongKham,
          NgayDate: dateStr, GioBatDau: '09:00:00', GioKetThuc: '09:30:00',
          LoaiKham: Math.random() > 0.5 ? 'TrucTiep' : 'Online', SoLuongToiDa: 10, SoLuongDaDat: 1
        });

        const apt = await DatLich.create({
          MaDatLich: `DL_H${pastDate.getTime()}_${j}`,
          Id_BenhNhan: patient.Id_BenhNhan, Id_LichKham: schedule.Id_LichKham,
          Id_PhongKham: clinic.Id_PhongKham, Id_BacSi: doctor.Id_BacSi,
          TrangThai: 'COMPLETED', GiaTien: doctor.PhiTuVan,
          TrieuChungSoBo: 'Theo dõi định kỳ', CompletedAt: pastDate
        });

        const hoso = await HoSoBenhAn.create({
          Id_DatLich: apt.Id_DatLich, Id_BenhNhan: apt.Id_BenhNhan, Id_BacSi: apt.Id_BacSi,
          ChanDoan: 'Sức khỏe ổn định', LoiDan: 'Tiếp tục duy trì chế độ ăn uống lành mạnh.', NgayTao: pastDate
        });

        const hoadon = await HoaDon.create({ Id_DatLich: apt.Id_DatLich, TongTien: apt.GiaTien, TrangThai: 'PAID', NgayTao: pastDate });
        await ThanhToan.create({ Id_HoaDon: hoadon.Id_HoaDon, MaGiaoDich: `TXN${apt.Id_DatLich}`, PhuongThuc: 'TienMat', SoTien: hoadon.TongTien, TrangThai: 'SUCCESS', NgayTao: pastDate });
      }
    }

    // 9. Upcoming Data (Next 7 days)
    console.log('>> Generating upcoming schedules...');
    for (let d = 0; d <= 7; d++) {
      const futureDate = new Date(now.getTime() + d * 86400000);
      const dateStr = futureDate.toISOString().split('T')[0];

      for (const doctor of createdDoctors) {
        await LichKham.create({
          Id_BacSi: doctor.Id_BacSi, Id_PhongKham: clinics[doctor.Id_BacSi % 5].Id_PhongKham,
          NgayDate: dateStr, GioBatDau: '08:00:00', GioKetThuc: '11:00:00',
          LoaiKham: 'TrucTiep', SoLuongToiDa: 15, SoLuongDaDat: 0
        });
      }
    }

    // 10. AI Triage & Notifications
    await AITuVanPhien.create({
      Id_NguoiDung: createdPatients[0].Id_NguoiDung, TrieuChungTomTat: 'Đau đầu kéo dài 3 ngày, kèm hoa mắt.',
      GoiYChuyenKhoa: 'Thần Kinh', MucDoUuTien: 'TrungBinh', NgayTao: new Date(), Id_PhongKham: clinics[0].Id_PhongKham
    });

    await ThongBao.create({ Id_NguoiDung: createdPatients[0].Id_NguoiDung, NoiDung: 'Chào mừng bạn đến với hệ thống MediSched AI!', Loai: 'System', DaDoc: false });

    console.log('--- PRODUCTION SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Summary:');
    console.log('- Clinics: 5 major hospitals');
    console.log('- Specialties: 10 departments');
    console.log('- Doctors: 20 certified physicians');
    console.log('- Patients: 10 active patients');
    console.log('- Appointments: 70+ historical, schedules for next 7 days');

  } catch (err) {
    console.error('CRITICAL SEEDING ERROR:', err);
  } finally {
    process.exit();
  }
}

seed();
