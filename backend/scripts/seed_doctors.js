const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { 
    sequelize, 
    VaiTro, 
    NguoiDung, 
    NguoiDung_VaiTro, 
    BacSi, 
    ChuyenKhoa, 
    PhongKham, 
    BacSi_PhongKham 
} = require('../models');

const mockDoctors = [
    {
        email: 'dr.maibaolan@medisched.com',
        phone: '0981234567',
        first_name: 'Mai Bảo',
        last_name: 'Lan',
        gender: 'Nu',
        specialty: 'Tim mạch',
        bio: 'Bác sĩ Mai Bảo Lan có 20 năm kinh nghiệm trong lĩnh vực Tim mạch, chuyên khám và điều trị tăng huyết áp, rối loạn nhịp tim, bệnh mạch vành, suy tim và tư vấn dự phòng tim mạch. Hỗ trợ tư vấn trực tiếp và trực tuyến, chú trọng chẩn đoán chính xác, theo dõi sát và hướng dẫn điều trị rõ ràng cho người bệnh.',
        experience: 20,
        fee: 500000,
        avatar: 'https://i.pravatar.cc/150?img=5',
        facilities: ['Bệnh viện Đa khoa ABC', 'Phòng khám Chuyên khoa XYZ']
    },
    {
        email: 'dr.tranvanhoa@medisched.com',
        phone: '0971234568',
        first_name: 'Trần Văn',
        last_name: 'Hòa',
        gender: 'Nam',
        specialty: 'Cơ Xương Khớp',
        bio: 'Bác sĩ Trần Văn Hòa có 15 năm kinh nghiệm trong lĩnh vực Cơ Xương Khớp, chuyên khám và điều trị thoái hóa khớp, viêm khớp dạng thấp, loãng xương, và thoát vị đĩa đệm. Bác sĩ hỗ trợ tư vấn trực tiếp và trực tuyến, chú trọng phục hồi chức năng và giảm đau an toàn.',
        experience: 15,
        fee: 400000,
        avatar: 'https://i.pravatar.cc/150?img=11',
        facilities: ['Bệnh viện Đa khoa ABC']
    },
    {
        email: 'dr.nguyenhaiduong@medisched.com',
        phone: '0961234569',
        first_name: 'Nguyễn Hải',
        last_name: 'Dương',
        gender: 'Nam',
        specialty: 'Tiêu hóa',
        bio: 'Bác sĩ Nguyễn Hải Dương có 12 năm kinh nghiệm trong lĩnh vực Tiêu hóa, chuyên khám và điều trị viêm loét dạ dày, trào ngược thực quản, hội chứng ruột kích thích và bệnh lý gan mật. Bác sĩ hỗ trợ tư vấn trực tiếp và trực tuyến, luôn lắng nghe và đưa ra phác đồ tối ưu.',
        experience: 12,
        fee: 350000,
        avatar: 'https://i.pravatar.cc/150?img=8',
        facilities: ['Phòng khám Chuyên khoa XYZ']
    },
    {
        email: 'dr.lethithu@medisched.com',
        phone: '0951234570',
        first_name: 'Lê Thị',
        last_name: 'Thu',
        gender: 'Nu',
        specialty: 'Nhi khoa',
        bio: 'Bác sĩ Lê Thị Thu có 10 năm kinh nghiệm trong lĩnh vực Nhi khoa, chuyên tư vấn dinh dưỡng, tiêm chủng, điều trị các bệnh lý hô hấp và tiêu hóa ở trẻ em. Bác sĩ hỗ trợ tư vấn trực tuyến và trực tiếp, tận tâm yêu trẻ và đồng hành cùng phụ huynh trong việc chăm sóc con cái.',
        experience: 10,
        fee: 300000,
        avatar: 'https://i.pravatar.cc/150?img=9',
        facilities: ['Bệnh viện Đa khoa ABC', 'Phòng khám Chuyên khoa XYZ']
    },
    {
        email: 'dr.phamquanghuy@medisched.com',
        phone: '0941234571',
        first_name: 'Phạm Quang',
        last_name: 'Huy',
        gender: 'Nam',
        specialty: 'Da liễu',
        bio: 'Bác sĩ Phạm Quang Huy có 8 năm kinh nghiệm trong lĩnh vực Da liễu, chuyên khám và điều trị mụn trứng cá, viêm da cơ địa, dị ứng da và tư vấn thẩm mỹ nội khoa. Phương châm làm việc là an toàn, hiệu quả và duy trì vẻ đẹp tự nhiên.',
        experience: 8,
        fee: 250000,
        avatar: 'https://i.pravatar.cc/150?img=12',
        facilities: ['Phòng khám Chuyên khoa XYZ']
    }
];

const mockFacilities = [
    {
        TenPhongKham: 'Bệnh viện Đa khoa ABC',
        DiaChi: '123 Nguyễn Văn Linh, Đà Nẵng'
    },
    {
        TenPhongKham: 'Phòng khám Chuyên khoa XYZ',
        DiaChi: '45 Hàm Nghi, Đà Nẵng'
    }
];

async function seedDoctors() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('Connected!');

        console.log('Cleaning up existing doctors...');
        
        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

        // User's provided safe delete script
        await sequelize.query('DELETE FROM chitietdonthuoc;');
        await sequelize.query('DELETE FROM donthuoc;');
        await sequelize.query('DELETE FROM hosobenhan;');
        await sequelize.query('DELETE FROM danhgia;');
        await sequelize.query('DELETE FROM datlich;');
        await sequelize.query('DELETE FROM lichkham;');

        await sequelize.query(`
            DELETE FROM nguoidung_vaitro
            WHERE Id_NguoiDung IN (
                SELECT Id_NguoiDung FROM bacsi
            );
        `);

        // also delete from junction tables
        await sequelize.query('DELETE FROM bacsi_phongkham;');

        await sequelize.query('DELETE FROM bacsi;');

        await sequelize.query(`
            DELETE FROM nguoidung
            WHERE Id_NguoiDung NOT IN (
                SELECT Id_NguoiDung FROM benhnhan
            ) AND Id_NguoiDung NOT IN (
                SELECT ndvt.Id_NguoiDung FROM nguoidung_vaitro ndvt
                JOIN vaitro vt ON vt.Id_VaiTro = ndvt.Id_VaiTro
                WHERE vt.MaVaiTro = 'admin' OR vt.MaVaiTro = 'staff'
            );
        `);

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Cleanup completed!');

        // Ensure roles
        const [doctorRole] = await VaiTro.findOrCreate({
            where: { MaVaiTro: 'doctor' },
            defaults: { TenVaiTro: 'Bác sĩ' }
        });

        // Ensure facilities
        const facilityMap = {};
        for (const f of mockFacilities) {
            const [facility] = await PhongKham.findOrCreate({
                where: { TenPhongKham: f.TenPhongKham },
                defaults: { DiaChi: f.DiaChi }
            });
            facilityMap[f.TenPhongKham] = facility.Id_PhongKham;
        }

        const passwordHash = await bcrypt.hash('123456', 10);

        for (const doc of mockDoctors) {
            // Ensure specialty
            const [specialty] = await ChuyenKhoa.findOrCreate({
                where: { TenChuyenKhoa: doc.specialty },
                defaults: { MoTa: 'Chuyên khoa ' + doc.specialty }
            });

            // Create User
            const user = await NguoiDung.create({
                Ho: doc.first_name,
                Ten: doc.last_name,
                Email: doc.email,
                MatKhau: passwordHash,
                SoDienThoai: doc.phone,
                GioiTinh: doc.gender,
                AnhDaiDien: doc.avatar,
                KichHoat: 1
            });

            // Assign Role
            await NguoiDung_VaiTro.create({
                Id_NguoiDung: user.Id_NguoiDung,
                Id_VaiTro: doctorRole.Id_VaiTro
            });

            // Create Doctor
            const doctor = await BacSi.create({
                Id_NguoiDung: user.Id_NguoiDung,
                Id_ChuyenKhoa: specialty.Id_ChuyenKhoa,
                SoNamKinhNghiem: doc.experience,
                PhiTuVan: doc.fee,
                GioiThieu: doc.bio,
                TrangThai: 'HoatDong'
            });

            // Assign Facilities
            let isPrimary = true;
            for (const facName of doc.facilities) {
                const facId = facilityMap[facName];
                if (facId) {
                    await BacSi_PhongKham.create({
                        doctor_id: doctor.Id_BacSi,
                        facility_id: facId,
                        is_primary: isPrimary,
                        consultation_fee_offline: doc.fee,
                        consultation_fee_online: doc.fee,
                        is_active: true
                    });
                    isPrimary = false; // Only first one is primary
                }
            }

            console.log(`Created doctor: BS. ${doc.first_name} ${doc.last_name}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedDoctors();
