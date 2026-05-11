const bcrypt = require('bcryptjs');
const {
  sequelize, VaiTro, NguoiDung, NguoiDung_VaiTro, ChuyenKhoa, BacSi, BenhNhan,
  PhongKham, LichKham, StaffProfile, Staff_Facility, DatLich,
  HoSoBenhAn, DonThuoc, ChiTietDonThuoc, DanhGia, HoaDon, ThanhToan,
  Conversation, ConversationParticipant, Message, MessageAttachment,
  CallSession, CallParticipant, SupportCase, AITuVanPhien, AITuVanTinNhan,
  ThongBao, BacSi_PhongKham, AdminProfile, TinNhanKham, AccessLog
} = require('./models');

async function seed() {
  console.log('--- STARTING DA NANG LOCALIZED PRODUCTION-READY SEEDING ---');

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

    // 2. Specialties (12 Local Specialties with Images)
    const specialtiesData = [
      { TenChuyenKhoa: 'Nội Tổng Quát', MoTa: 'Khám và điều trị các bệnh lý nội khoa chung.', HinhAnh: '/images/specialties/noi_tong_quat.png' },
      { TenChuyenKhoa: 'Tim Mạch', MoTa: 'Chẩn đoán và điều trị bệnh lý tim, mạch máu và tăng huyết áp.', HinhAnh: '/images/specialties/tim_mach.png' },
      { TenChuyenKhoa: 'Thần Kinh', MoTa: 'Chẩn đoán và điều trị các bệnh lý não và hệ thần kinh.', HinhAnh: '/images/specialties/than_kinh.png' },
      { TenChuyenKhoa: 'Cơ Xương Khớp', MoTa: 'Điều trị các bệnh về hệ vận động, xương, khớp và cơ.', HinhAnh: '/images/specialties/co_xuong_khop.png' },
      { TenChuyenKhoa: 'Nhi Khoa', MoTa: 'Chăm sóc sức khỏe và điều trị bệnh cho trẻ em.', HinhAnh: '/images/specialties/nhi_khoa.png' },
      { TenChuyenKhoa: 'Sản Phụ Khoa', MoTa: 'Chăm sóc sức khỏe phụ nữ, thai sản và phụ khoa.', HinhAnh: '/images/specialties/san_phu_khoa.png' },
      { TenChuyenKhoa: 'Tai Mũi Họng', MoTa: 'Khám và điều trị các bệnh về tai, mũi, họng.', HinhAnh: '/images/specialties/tai_mui_hong.png' },
      { TenChuyenKhoa: 'Da Liễu', MoTa: 'Điều trị các bệnh về da, tóc và móng.', HinhAnh: '/images/specialties/da_lieu.png' },
      { TenChuyenKhoa: 'Tiêu Hóa', MoTa: 'Khám và điều trị các bệnh về đường tiêu hóa.', HinhAnh: '/images/specialties/tieu_hoa.png' },
      { TenChuyenKhoa: 'Mắt', MoTa: 'Chăm sóc thị lực và điều trị các bệnh về mắt.', HinhAnh: '/images/specialties/mat.png' },
      { TenChuyenKhoa: 'Răng Hàm Mặt', MoTa: 'Khám và điều trị các bệnh về răng miệng.', HinhAnh: '/images/specialties/rang_ham_mat.png' },
      { TenChuyenKhoa: 'Ngoại Tổng Quát', MoTa: 'Phẫu thuật và điều trị các bệnh lý ngoại khoa.', HinhAnh: '/images/specialties/ngoai_tong_quat.png' }
    ];
    const specialties = await ChuyenKhoa.bulkCreate(specialtiesData);

    // 3. Da Nang Hospitals (5 Major Facilities)
    const clinicsData = [
      { TenPhongKham: 'Bệnh viện Đa khoa Đà Nẵng', DiaChi: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng', SoDienThoai: '0236.3821.118', UrlBanner: '/images/hinh_bv_da_khoa.jpg', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện C Đà Nẵng', DiaChi: '13 Hải Phòng, Hải Châu, Đà Nẵng', SoDienThoai: '0236.3821.480', UrlBanner: '/images/hinh_bv_C.jpg', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện Hoàn Mỹ Đà Nẵng', DiaChi: '291 Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng', SoDienThoai: '0236.3650.676', UrlBanner: '/images/hinh_bv_hoan_my.jpg', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện Phụ sản - Nhi Đà Nẵng', DiaChi: '402 Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng', SoDienThoai: '0236.3957.777', UrlBanner: '/images/hinh_bv_phu_san.jpg', TrangThai: 'HoatDong' },
      { TenPhongKham: 'Bệnh viện Ung bướu Đà Nẵng', DiaChi: 'Phùng Hưng, Hòa Minh, Liên Chiểu, Đà Nẵng', SoDienThoai: '0236.3717.717', UrlBanner: '/images/hinh_bv_ung_buou.jpg', TrangThai: 'HoatDong' }
    ];
    const clinics = await PhongKham.bulkCreate(clinicsData);

    // 4. Admin
    const adminUser = await NguoiDung.create({ Ho: 'Hệ Thống', Ten: 'Admin', Email: 'admin@medischedule.com', MatKhau: hashedPassword });
    await NguoiDung_VaiTro.create({ Id_NguoiDung: adminUser.Id_NguoiDung, Id_VaiTro: roleMap['admin'] });
    await AdminProfile.create({ user_id: adminUser.Id_NguoiDung, role_level: 'superadmin', can_create_admins: true });

    // 5. Staff (1 per clinic)
    const staffNames = [['Nguyễn', 'Thanh Tùng'], ['Lê', 'Thị Bích'], ['Phạm', 'Thanh Hải'], ['Trần', 'Văn An'], ['Hoàng', 'Minh Nhật']];
    const createdStaffUsers = [];
    for (let i = 0; i < 5; i++) {
      const user = await NguoiDung.create({ 
        Ho: staffNames[i][0], Ten: staffNames[i][1], 
        Email: `staff${i+1}@medischedule.com`, MatKhau: hashedPassword,
        AnhDaiDien: `/images/cute_doc_${i+1}.png` 
      });
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: roleMap['staff'] });
      const profile = await StaffProfile.create({ user_id: user.Id_NguoiDung, employee_code: `STF-DN-${100+i}`, status: 'active' });
      await Staff_Facility.create({ staff_id: profile.id, facility_id: clinics[i].Id_PhongKham, is_active: true, can_reception: true, can_payment: true });
      createdStaffUsers.push(user);
    }

    // 6. Doctors (200 Doctors localized to Da Nang)
    console.log('>> Generating 200 detailed doctor profiles...');
    const hoList = ['Nguyễn', 'Lê', 'Phạm', 'Trần', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    const lotList = ['Văn', 'Thị', 'Quang', 'Minh', 'Thanh', 'Ngọc', 'Đình', 'Hữu', 'Đức', 'Thành', 'Hải'];
    const tenList = ['Hùng', 'Dũng', 'Cường', 'Anh', 'Minh', 'Thắng', 'Sơn', 'Tùng', 'Hà', 'Lan', 'Hương', 'Hạnh', 'Tuấn', 'Lâm', 'Hải', 'Nam', 'Trang', 'Tuyết', 'Mai', 'Bình', 'Chi', 'Dương', 'Liên', 'Quân', 'Thảo', 'Yến'];
    
    const degrees = ['Thạc sĩ, Bác sĩ', 'Bác sĩ chuyên khoa I', 'Bác sĩ chuyên khoa II', 'Tiến sĩ, Bác sĩ', 'Bác sĩ nội trú'];
    const uniList = ['ĐH Y Dược Huế', 'ĐH Y Hà Nội', 'ĐH Y Dược TP.HCM', 'ĐH Kỹ thuật Y - Dược Đà Nẵng', 'ĐH Duy Tân (Khoa Y)'];
    const hospitalList = ['Bệnh viện Đa khoa Đà Nẵng', 'Bệnh viện C Đà Nẵng', 'Bệnh viện Hoàn Mỹ Đà Nẵng', 'Bệnh viện Phụ sản - Nhi Đà Nẵng', 'Bệnh viện Ung bướu Đà Nẵng'];

    const createdDoctors = [];
    for (let i = 0; i < 200; i++) {
      const ho = hoList[Math.floor(Math.random() * hoList.length)];
      const lot = lotList[Math.floor(Math.random() * lotList.length)];
      const ten = tenList[Math.floor(Math.random() * tenList.length)];
      const email = `doctor_dn_${i + 1}@medischedule.com`;
      
      const user = await NguoiDung.create({ 
        Ho: ho, Ten: `${lot} ${ten}`, 
        Email: email, MatKhau: hashedPassword,
        AnhDaiDien: `/images/cute_doc_${(i % 8) + 1}.png`,
        SoDienThoai: `090${Math.floor(1000000 + Math.random() * 9000000)}`
      });
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: roleMap['doctor'] });
      
      const specialty = specialties[i % specialties.length];
      const degree = degrees[Math.floor(Math.random() * degrees.length)];
      const uni = uniList[Math.floor(Math.random() * uniList.length)];
      const workplace = hospitalList[i % hospitalList.length];

      const doctor = await BacSi.create({
        Id_NguoiDung: user.Id_NguoiDung,
        Id_ChuyenKhoa: specialty.Id_ChuyenKhoa,
        PhiTuVan: 150000 + (Math.floor(Math.random() * 8) * 50000),
        SoNamKinhNghiem: 5 + Math.floor(Math.random() * 25),
        TrangThai: 'HoatDong',
        HocHamHocVi: degree,
        NoiDaoTao: uni,
        NoiLamViec: workplace,
        GioiThieu: `Bác sĩ ${ho} ${lot} ${ten} là chuyên gia đầu ngành trong lĩnh vực ${specialty.TenChuyenKhoa}. Với hơn ${5 + Math.floor(Math.random() * 25)} năm kinh nghiệm làm việc tại các bệnh viện lớn như ${workplace}, bác sĩ đã điều trị thành công cho hàng nghìn ca bệnh phức tạp. Bác sĩ luôn tận tâm, chu đáo và không ngừng cập nhật kiến thức y khoa mới nhất.`,
        DichVuCungCap: `Tư vấn và điều trị chuyên sâu ${specialty.TenChuyenKhoa}; Theo dõi bệnh lý mãn tính; Khám sức khỏe tổng quát; Phẫu thuật nội soi (nếu có).`,
        LichLamViec: JSON.stringify([
          { day: 'monday', start_time: '08:00', end_time: '11:30' },
          { day: 'wednesday', start_time: '13:30', end_time: '17:00' },
          { day: 'friday', start_time: '08:00', end_time: '17:00' }
        ])
      });
      createdDoctors.push(doctor);

      // Link to clinics (Even distribution)
      const cIdx = i % clinics.length;
      await BacSi_PhongKham.create({ doctor_id: doctor.Id_BacSi, facility_id: clinics[cIdx].Id_PhongKham, is_primary: true });
      
      // Some doctors work at a second clinic
      if (i % 7 === 0) {
        await BacSi_PhongKham.create({ doctor_id: doctor.Id_BacSi, facility_id: clinics[(cIdx + 1) % clinics.length].Id_PhongKham, is_primary: false });
      }
    }

    // 7. Patients (10 Local Patients)
    const patientNames = [['Trần', 'Anh'], ['Lê', 'Bình'], ['Nguyễn', 'Chi'], ['Hoàng', 'Dương'], ['Phạm', 'Em'], ['Vũ', 'Giang'], ['Đặng', 'Hoa'], ['Bùi', 'Hùng'], ['Đỗ', 'Kiên'], ['Phan', 'Liên']];
    const createdPatients = [];
    for (let i = 0; i < 10; i++) {
      const user = await NguoiDung.create({ Ho: patientNames[i][0], Ten: patientNames[i][1], Email: `patient${i+1}@gmail.com`, MatKhau: hashedPassword });
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: roleMap['patient'] });
      const patient = await BenhNhan.create({ Id_NguoiDung: user.Id_NguoiDung, MaBenhNhan: `BN-DN-${1000 + i}` });
      createdPatients.push(patient);
    }

    // 8. Historical Records (BỎ QUA VÌ SCHEMA THAY ĐỔI NHIỀU)
    console.log('>> Skipping historical records due to schema mismatch...');
    console.log('--- MASTER DATA SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('CRITICAL SEEDING ERROR:', err);
  } finally {
    process.exit();
  }
}

seed();
