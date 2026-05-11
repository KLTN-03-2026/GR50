const { BacSi } = require('../models');

const updateDoctors = async () => {
  try {
    const doctors = await BacSi.findAll();
    console.log(`Found ${doctors.length} doctors to update.`);

    const trainingPlaces = [
      'Đại học Kỹ thuật Y - Dược Đà Nẵng',
      'Đại học Y Dược Huế',
      'Khoa Y Dược - Đại học Đà Nẵng',
      'Đại học Y Hà Nội',
      'Đại học Y Dược TP.HCM',
      'Học viện Quân y'
    ];

    const languages = [
      'Tiếng Việt, Tiếng Anh',
      'Tiếng Việt',
      'Tiếng Việt, Tiếng Pháp',
      'Tiếng Việt, Tiếng Nhật'
    ];

    const services = [
      'Khám và tư vấn điều trị nội khoa, nội soi tiêu hóa.',
      'Khám sàng lọc, tư vấn sức khỏe định kỳ.',
      'Điều trị các bệnh lý mãn tính, tư vấn dinh dưỡng.',
      'Phẫu thuật ngoại khoa, tư vấn sau mổ.'
    ];

    const degrees = [
      'Bác sĩ Chuyên khoa I',
      'Bác sĩ Chuyên khoa II',
      'Thạc sĩ, Bác sĩ',
      'Tiến sĩ, Bác sĩ',
      'Thạc sĩ, Bác sĩ Nội trú'
    ];

    const workplaces = [
      'Bệnh viện Đa khoa Đà Nẵng',
      'Bệnh viện C Đà Nẵng',
      'Bệnh viện Hoàn Mỹ Đà Nẵng',
      'Bệnh viện Phụ sản - Nhi Đà Nẵng',
      'Bệnh viện Ung bướu Đà Nẵng'
    ];

    for (let i = 0; i < doctors.length; i++) {
      const doc = doctors[i];
      await doc.update({
        NoiDaoTao: trainingPlaces[i % trainingPlaces.length],
        NoiLamViec: workplaces[i % workplaces.length],
        HocHamHocVi: degrees[i % degrees.length],
        NgonNgu: languages[i % languages.length],
        DichVuCungCap: services[i % services.length],
        TrangThaiHoSo: 'DaDuyet',
        // Ensure they have a specialty if missing
        Id_ChuyenKhoa: doc.Id_ChuyenKhoa || 1, 
        AnhBangCap: JSON.stringify([
          'https://img.freepik.com/free-vector/professional-certificate-template-flat-design_23-2148203356.jpg',
          'https://img.freepik.com/free-vector/modern-certificate-template-with-golden-frame_23-2148203356.jpg'
        ])
      });
    }

    console.log('Successfully updated all doctors professional info.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating doctors:', error);
    process.exit(1);
  }
};

updateDoctors();
