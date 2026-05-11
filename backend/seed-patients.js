const { sequelize, NguoiDung, VaiTro, NguoiDung_VaiTro, BenhNhan, PhongKham, BacSi, LichKham, DatLich } = require('./models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

async function seedPatients() {
  console.log('--- STARTING 1-MONTH PATIENT DATA SEEDING ---');
  try {
    const hashedPassword = await bcrypt.hash('12345678', 10);
    const role = await VaiTro.findOne({ where: { MaVaiTro: 'patient' } });
    
    // Fetch existing master data
    const clinics = await PhongKham.findAll();
    const doctors = await BacSi.findAll();
    
    console.log(`Found ${clinics.length} clinics and ${doctors.length} doctors.`);

    // 1. Create 150 New Patients
    console.log('Generating 150 new patients...');
    const hoList = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
    const tenList = ['Anh', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hoa', 'Hùng', 'Hương', 'Kiên', 'Lan', 'Linh', 'Mai', 'Minh', 'Nam', 'Nga', 'Ngọc', 'Nhung', 'Phúc', 'Phương', 'Quang', 'Quyên', 'Sơn', 'Tài', 'Thảo', 'Thắng', 'Thành', 'Thu', 'Trang', 'Trung', 'Tuấn', 'Tùng', 'Uyên', 'Vân', 'Việt', 'Yến'];
    
    const createdPatients = [];
    for (let i = 0; i < 150; i++) {
      const ho = hoList[Math.floor(Math.random() * hoList.length)];
      const ten = tenList[Math.floor(Math.random() * tenList.length)];
      
      const user = await NguoiDung.create({ 
        Ho: ho, 
        Ten: ten, 
        Email: `benhnhan_${Date.now()}_${i}@gmail.com`, 
        MatKhau: hashedPassword,
        SoDienThoai: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        GioiTinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
        NgaySinh: new Date(1960 + Math.floor(Math.random() * 50), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
      });
      await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: role.Id_VaiTro });
      const patient = await BenhNhan.create({ Id_NguoiDung: user.Id_NguoiDung, MaBenhNhan: `BN-${Date.now()}-${i}` });
      createdPatients.push(patient);
    }

    // 2. Generate Appointments for the past 30 days
    console.log('Generating appointments for the past 30 days...');
    const now = new Date();
    const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'CHECKED_IN'];
    const reasons = ['Khám tổng quát', 'Đau đầu', 'Đau dạ dày', 'Tái khám', 'Mất ngủ', 'Đau mỏi vai gáy', 'Tư vấn sức khỏe', 'Sốt kéo dài'];

    let appointmentCount = 0;

    for (let d = 30; d >= 0; d--) {
      const targetDate = new Date(now.getTime() - d * 86400000);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      // For each day, create 30-50 appointments across all clinics
      const dailyApts = 30 + Math.floor(Math.random() * 20);
      
      for (let j = 0; j < dailyApts; j++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const clinic = clinics[Math.floor(Math.random() * clinics.length)]; 
        const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
        
        // Ensure doctor has a schedule
        const startHour = 8 + Math.floor(Math.random() * 8); // 8 AM to 4 PM
        const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
        const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00:00`;

        const [schedule] = await LichKham.findOrCreate({
          where: {
            Id_BacSi: doctor.Id_BacSi,
            NgayDate: dateStr,
            GioBatDau: startTime
          },
          defaults: {
            Id_PhongKham: clinic.Id_PhongKham,
            GioKetThuc: endTime,
            LoaiKham: 'TrucTiep',
            SoLuongToiDa: 5,
            SoLuongDaDat: 0
          }
        });

        if (schedule.SoLuongDaDat < schedule.SoLuongToiDa) {
          const status = d === 0 ? 'PENDING' : statuses[Math.floor(Math.random() * statuses.length)];
          
          await DatLich.create({
            MaDatLich: `DL-${targetDate.getTime()}-${j}`,
            Id_BenhNhan: patient.Id_BenhNhan,
            Id_LichKham: schedule.Id_LichKham,
            Id_PhongKham: schedule.Id_PhongKham,
            Id_BacSi: doctor.Id_BacSi,
            TrangThai: status,
            GiaTien: doctor.PhiTuVan || 150000,
            TrieuChungSoBo: reasons[Math.floor(Math.random() * reasons.length)],
            NgayTao: new Date(targetDate.getTime() - 86400000 * (1 + Math.floor(Math.random() * 5))),
            CompletedAt: status === 'COMPLETED' ? new Date(targetDate.getTime() + 3600000) : null
          });

          await schedule.increment('SoLuongDaDat');
          appointmentCount++;
        }
      }
    }

    console.log(`Successfully generated ${appointmentCount} appointments for ${createdPatients.length} patients over the past 1 month!`);

  } catch (error) {
    console.error('ERROR SEEDING PATIENTS:', error);
  } finally {
    process.exit();
  }
}

seedPatients();
