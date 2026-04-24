const { PhongKham, BacSi, NguoiDung, DanhGia, DatLich, BenhNhan, ThongBao, VaiTro, sequelize } = require('../models');
const { Op } = require('sequelize');

async function seedUX() {
    console.log('--- Seeding UX Enhancements ---');

    // 1. Update Clinics with Images
    const clinics = await PhongKham.findAll();
    for (const clinic of clinics) {
        let banner = '/images/hinh_bv_C.jpg';

        if (clinic.TenPhongKham.includes('Phụ sản')) {
            banner = '/images/hinh_bv_phu_san.jpg';
        } else if (clinic.TenPhongKham.includes('Đa khoa')) {
            banner = '/images/hinh_bv_da_khoa.jpg';
        } else if (clinic.TenPhongKham.includes('Ung bướu')) {
            banner = '/images/hinh_bv_ung_buou.jpg';
        } else if (clinic.TenPhongKham.includes('Hoàn Mỹ')) {
            banner = '/images/hinh_bv_hoan_my.jpg';
        }
        
        await clinic.update({ 
            UrlBanner: banner,
            UrlLogo: banner // Use the same image for logo as interior images are missing
        });
    }
    console.log('Updated clinic images.');

    // 2. Update Doctor Avatars
    const doctors = await BacSi.findAll({ include: [{ model: NguoiDung }] });
    let docIdx = 0;
    const cuteAvatars = [
        '/images/cute_doc_1.png',
        '/images/cute_doc_2.png',
        '/images/cute_doc_3.png',
        '/images/cute_doc_4.png',
        '/images/cute_doc_5.png',
        '/images/cute_doc_6.png',
        '/images/cute_doc_7.png',
        '/images/cute_doc_8.png'
    ];

    for (const doctor of doctors) {
        if (doctor.NguoiDung) {
            const avatar = cuteAvatars[docIdx % cuteAvatars.length];
            await doctor.NguoiDung.update({ AnhDaiDien: avatar });
            docIdx++;
        }
    }
    console.log('Updated doctor avatars with cute 3D versions.');

    // 3. Create Reviews (DanhGia) for Doctors
    const patients = await BenhNhan.findAll();
    if (patients.length > 0) {
        for (const doctor of doctors) {
            // Check if already has reviews
            const reviewCount = await DanhGia.count({ where: { Id_BacSi: doctor.Id_BacSi } });
            if (reviewCount === 0) {
                // Create 2-3 reviews per doctor
                for (let i = 0; i < 2; i++) {
                    const patient = patients[Math.floor(Math.random() * patients.length)];
                    await DanhGia.create({
                        Id_BacSi: doctor.Id_BacSi,
                        Id_BenhNhan: patient.Id_BenhNhan,
                        SoSao: 4 + Math.floor(Math.random() * 2), // 4 or 5 stars
                        BinhLuan: i === 0 ? 'Bác sĩ rất tận tâm và chuyên nghiệp.' : 'Dịch vụ tốt, bác sĩ tư vấn kỹ lưỡng.',
                        NgayTao: new Date()
                    });
                }
            }
        }
    }
    console.log('Created reviews for doctors.');

    // 4. Create Notifications (ThongBao) for All Users
    const users = await NguoiDung.findAll({ include: [{ model: VaiTro, as: 'VaiTros' }] });
    for (const user of users) {
        const roles = user.VaiTros.map(r => r.MaVaiTro);
        
        // General welcome
        await ThongBao.create({
            Id_NguoiDung: user.Id_NguoiDung,
            TieuDe: 'Chào mừng bạn đến với MediSched AI',
            NoiDung: 'Hệ thống đã được cập nhật giao diện mới. Chúc bạn có trải nghiệm tuyệt vời!',
            Loai: 'system',
            DaDoc: false,
            NgayTao: new Date()
        });

        if (roles.includes('patient')) {
            await ThongBao.create({
                Id_NguoiDung: user.Id_NguoiDung,
                TieuDe: 'Nhắc nhở lịch khám',
                NoiDung: 'Bạn có lịch hẹn sắp tới vào ngày mai. Vui lòng kiểm tra lại thời gian.',
                Loai: 'appointment',
                DaDoc: false,
                NgayTao: new Date()
            });
        }

        if (roles.includes('doctor')) {
            await ThongBao.create({
                Id_NguoiDung: user.Id_NguoiDung,
                TieuDe: 'Hồ sơ bệnh án mới',
                NoiDung: 'Có kết quả xét nghiệm mới cho bệnh nhân Nguyễn Văn A.',
                Loai: 'medical',
                DaDoc: false,
                NgayTao: new Date()
            });
        }

        if (roles.includes('staff')) {
            await ThongBao.create({
                Id_NguoiDung: user.Id_NguoiDung,
                TieuDe: 'Yêu cầu hỗ trợ',
                NoiDung: 'Có bệnh nhân đang chờ tại sảnh chính cơ sở Đà Nẵng.',
                Loai: 'task',
                DaDoc: false,
                NgayTao: new Date()
            });
        }
    }
    console.log('Created notifications for all users.');

    console.log('--- UX Seeding Complete ---');
    process.exit(0);
}

seedUX().catch(err => {
    console.error(err);
    process.exit(1);
});
