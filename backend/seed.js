const bcrypt = require('bcryptjs');
const {
  sequelize,
  VaiTro,
  NguoiDung,
  NguoiDung_VaiTro,
  ChuyenKhoa,
  BacSi,
  BenhNhan
} = require('./models');

async function seed() {
  console.log('Seeding Database...');

  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // 1. Roles (VaiTrò)
    const rolesData = [
      { MaVaiTro: 'admin', TenVaiTro: 'Quản trị viên', MoTa: 'Toàn quyền hệ thống' },
      { MaVaiTro: 'doctor', TenVaiTro: 'Bác sĩ', MoTa: 'Chẩn đoán và khám bệnh' },
      { MaVaiTro: 'patient', TenVaiTro: 'Bệnh nhân', MoTa: 'Đăng ký khám' },
      { MaVaiTro: 'staff', TenVaiTro: 'Nhân viên / Lễ tân', MoTa: 'Tiếp nhận và điều phối vận hành' }
    ];
    const roles = await VaiTro.bulkCreate(rolesData);

    const adminRole = roles.find(r => r.MaVaiTro === 'admin');
    const patientRole = roles.find(r => r.MaVaiTro === 'patient');
    const doctorRole = roles.find(r => r.MaVaiTro === 'doctor');

    // 2. Chuyên khoa (Specialties)
    const specialtiesData = [
      { TenChuyenKhoa: 'Cơ Xương Khớp', MoTa: 'Bệnh lý về hệ thần kinh, hệ cơ và xương.', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Thần Kinh', MoTa: 'Bệnh lý hệ thần kinh.', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Tiêu Hóa', MoTa: 'Bệnh lý ống tiêu hoá.', TrangThai: 'HoatDong' },
      { TenChuyenKhoa: 'Tim Mạch', MoTa: 'Bệnh lý về hệ tim mạch.', TrangThai: 'HoatDong' }
    ];
    const specialties = await ChuyenKhoa.bulkCreate(specialtiesData);

    // 3. Người dùng Admin
    const hashedPassword = await bcrypt.hash('12345678', 10);
    const adminUser = await NguoiDung.create({
      Ho: 'Quản',
      Ten: 'Trị',
      Email: 'admin@medischedule.com',
      MatKhau: hashedPassword,
      TrangThai: 'HoatDong'
    });
    await NguoiDung_VaiTro.create({ Id_NguoiDung: adminUser.Id_NguoiDung, Id_VaiTro: adminRole.Id_VaiTro });

    // 4. Bác sĩ (Doctors)
    const doctorUsers = await NguoiDung.bulkCreate([
      { Ho: 'Nguyễn', Ten: 'Lân Việt', Email: 'bs.viet@hospital.com', MatKhau: hashedPassword, TrangThai: 'HoatDong' },
      { Ho: 'Phạm', Ten: 'Minh Thông', Email: 'bs.thong@hospital.com', MatKhau: hashedPassword, TrangThai: 'HoatDong' },
      { Ho: 'Ngô', Ten: 'Quý Châu', Email: 'bs.chau@hospital.com', MatKhau: hashedPassword, TrangThai: 'HoatDong' }
    ]);

    for (const doct of doctorUsers) {
      await NguoiDung_VaiTro.create({ Id_NguoiDung: doct.Id_NguoiDung, Id_VaiTro: doctorRole.Id_VaiTro });
    }

    const doctorsData = [
      { Id_NguoiDung: doctorUsers[0].Id_NguoiDung, Id_ChuyenKhoa: specialties[0].Id_ChuyenKhoa, SoNamKinhNghiem: 30, HocHamHocVi: 'Tiến sĩ', NoiLamViec: 'Bệnh viện Bạch Mai - 21.002008, 105.840785', PhiTuVan: 500000, TrangThai: 'HoatDong' },
      { Id_NguoiDung: doctorUsers[1].Id_NguoiDung, Id_ChuyenKhoa: specialties[1].Id_ChuyenKhoa, SoNamKinhNghiem: 25, HocHamHocVi: 'Phó Giáo sư', NoiLamViec: 'Bệnh viện Chợ Rẫy - 10.757049, 106.658253', PhiTuVan: 400000, TrangThai: 'HoatDong' },
      { Id_NguoiDung: doctorUsers[2].Id_NguoiDung, Id_ChuyenKhoa: specialties[2].Id_ChuyenKhoa, SoNamKinhNghiem: 40, HocHamHocVi: 'Giáo sư', NoiLamViec: 'Bệnh viện Đại học Y Dược TP.HCM - 10.755452, 106.666324', PhiTuVan: 600000, TrangThai: 'HoatDong' }
    ];
    await BacSi.bulkCreate(doctorsData);

    console.log('Seeding Database Completed Successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit();
  }
}

seed();
