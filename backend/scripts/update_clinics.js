const models = require('../models');

async function updateClinics() {
    const daNangClinics = [
        { id: 1, name: 'Bệnh viện C Đà Nẵng', address: '122 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng' },
        { id: 2, name: 'Bệnh viện Phụ sản - Nhi Đà Nẵng', address: '402 Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng' },
        { id: 3, name: 'Bệnh viện Đa khoa Đà Nẵng', address: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng' },
        { id: 4, name: 'Bệnh viện Ung bướu Đà Nẵng', address: 'Hòa Minh, Liên Chiểu, Đà Nẵng' },
        { id: 5, name: 'Bệnh viện Hoàn Mỹ Đà Nẵng', address: '291 Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng' }
    ];

    for (const clinic of daNangClinics) {
        await models.PhongKham.update(
            { TenPhongKham: clinic.name, DiaChi: clinic.address },
            { where: { Id_PhongKham: clinic.id } }
        );
    }
    
    // Ensure all doctors have NoiLamViec as 'Đà Nẵng'
    await models.BacSi.update(
        { NoiLamViec: 'Đà Nẵng' },
        { where: {} }
    );

    console.log('Updated all clinics to Da Nang successfully.');
    process.exit(0);
}

updateClinics();
