const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixImages() {
    console.log('🚀 Starting image path fix...');
    
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'database_benhvien'
    });

    try {
        // 1. Fix Specialties (ChuyenKhoa)
        console.log('📦 Fixing Specialty images...');
        const specialtyMap = {
            'Cơ Xương Khớp': '/images/specialties/co_xuong_khop.png',
            'Thần Kinh': '/images/specialties/than_kinh.png',
            'Tiêu Hóa': '/images/specialties/tieu_hoa.png',
            'Tim Mạch': '/images/specialties/tim_mach.png',
            'Nội Tổng Quát': '/images/specialties/noi_tong_quat.png',
            'Ngoại Tổng Quát': '/images/specialties/ngoai_tong_quat.png',
            'Sản Phụ Khoa': '/images/specialties/san_phu_khoa.png',
            'Nhi Khoa': '/images/specialties/nhi_khoa.png',
            'Da Liễu': '/images/specialties/da_lieu.png',
            'Mắt': '/images/specialties/mat.png',
            'Tai Mũi Họng': '/images/specialties/tai_mui_hong.png',
            'Răng Hàm Mặt': '/images/specialties/rang_ham_mat.png'
        };

        for (const [name, path] of Object.entries(specialtyMap)) {
            await db.query(
                'UPDATE ChuyenKhoa SET image = ? WHERE TenChuyenKhoa = ?',
                [path, name]
            );
        }

        // 2. Fix Clinics (PhongKham) - Banners and Logos
        console.log('🏥 Fixing Clinic images...');
        const facilityImages = [
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1586773860418-d3b97998c637?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1502740479796-61c9fe1753f0?auto=format&fit=crop&q=80&w=800'
        ];

        const [clinics] = await db.query('SELECT Id_PhongKham FROM PhongKham');
        for (let i = 0; i < clinics.length; i++) {
            const img = facilityImages[i % facilityImages.length];
            await db.query(
                'UPDATE PhongKham SET UrlBanner = ?, UrlLogo = ? WHERE Id_PhongKham = ?',
                [img, img, clinics[i].Id_PhongKham]
            );
        }

        // 3. Fix Doctor Avatars (NguoiDung)
        console.log('👨‍⚕️ Fixing User avatars...');
        await db.query('UPDATE NguoiDung SET AnhDaiDien = NULL WHERE AnhDaiDien = "" OR AnhDaiDien = " "');

        console.log('✅ All image paths updated in database!');
    } catch (err) {
        console.error('❌ Error updating images:', err);
    } finally {
        await db.end();
    }
}

fixImages();
