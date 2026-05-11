const { DatLich, HoSoBenhAn, HoaDon, ThanhToan, BenhNhan, BacSi, PhongKham } = require('./models');

async function seedRecords() {
  console.log('--- STARTING MEDICAL RECORDS & PAYMENT SEEDING ---');
  try {
    const appointments = await DatLich.findAll({
      include: [
        { model: BenhNhan },
        { model: BacSi },
        { model: PhongKham, as: 'Clinic' }
      ]
    });

    console.log(`Processing ${appointments.length} appointments...`);

    let recordCount = 0;
    let invoiceCount = 0;
    let paymentCount = 0;

    for (const apt of appointments) {
      // 1. Create Invoices for most appointments
      if (Math.random() > 0.1) {
        const isPaid = Math.random() > 0.3; // 70% paid
        const invoice = await HoaDon.create({
          MaHoaDon: `HD-${apt.Id_DatLich}-${Date.now()}`,
          Id_DatLich: apt.Id_DatLich,
          Id_PhongKham: apt.Id_PhongKham,
          patientId: apt.Id_BenhNhan,
          Id_BacSi: apt.Id_BacSi,
          TongTienKham: apt.GiaTien,
          TongTien: apt.GiaTien,
          TrangThai: isPaid ? 'PAID' : 'WAITING_PAYMENT',
          NgayTao: apt.NgayTao || new Date()
        });
        invoiceCount++;

        // 2. Create Payment for PAID invoices
        if (isPaid) {
          await ThanhToan.create({
            Id_HoaDon: invoice.Id_HoaDon,
            Id_DatLich: apt.Id_DatLich,
            Id_BenhNhan: apt.Id_BenhNhan,
            Id_PhongKham: apt.Id_PhongKham,
            MaGiaoDich: `TXN-${apt.Id_DatLich}-${Date.now()}`,
            PhuongThuc: Math.random() > 0.5 ? 'TienMat' : 'VNPay',
            SoTien: apt.GiaTien,
            TrangThai: 'SUCCESS',
            NgayTao: apt.CompletedAt || apt.NgayTao || new Date()
          });
          paymentCount++;
        }
      }

      // 3. Create Medical Records for COMPLETED appointments
      if (apt.TrangThai === 'COMPLETED') {
        const diagnoses = [
          'Viêm họng cấp', 'Cảm cúm', 'Rối loạn tiêu hóa', 'Viêm loét dạ dày', 
          'Đau dây thần kinh tọa', 'Thoát vị đĩa đệm nhẹ', 'Suy nhược cơ thể',
          'Viêm xoang', 'Dị ứng thời tiết', 'Tăng huyết áp nhẹ'
        ];
        const advice = [
          'Nghỉ ngơi nhiều, uống đủ nước.',
          'Ăn uống thanh đạm, tránh đồ cay nóng.',
          'Tái khám sau 1 tuần nếu không đỡ.',
          'Uống thuốc đúng liều lượng chỉ định.',
          'Hạn chế vận động mạnh trong vài ngày.'
        ];

        await HoSoBenhAn.create({
          Id_DatLich: apt.Id_DatLich,
          Id_BenhNhan: apt.Id_BenhNhan,
          Id_BacSi: apt.Id_BacSi,
          Id_PhongKham: apt.Id_PhongKham,
          ChanDoan: diagnoses[Math.floor(Math.random() * diagnoses.length)],
          LoiDan: advice[Math.floor(Math.random() * advice.length)],
          NgayTao: apt.CompletedAt || apt.NgayTao || new Date()
        });
        recordCount++;
      }
    }

    console.log(`Successfully created:
    - ${invoiceCount} Invoices (HoaDon)
    - ${paymentCount} Payments (ThanhToan)
    - ${recordCount} Medical Records (HoSoBenhAn)`);

  } catch (error) {
    console.error('ERROR SEEDING RECORDS:', error);
  } finally {
    process.exit();
  }
}

seedRecords();
