const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { ChuyenKhoa } = require('../models');

const specialtyImages = {
    'Nội Tổng Quát': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    'Tim Mạch': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528',
    'Thần Kinh': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
    'Cơ Xương Khớp': 'https://images.unsplash.com/photo-1512678080530-7760d81faba6',
    'Nhi Khoa': 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b',
    'Sản Phụ Khoa': 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed',
    'Tai Mũi Họng': 'https://images.unsplash.com/photo-1559839734-2b71f1e3c77c',
    'Da Liễu': 'https://images.unsplash.com/photo-1527613426441-4da17471b66d',
    'Tiêu Hóa': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de',
    'Mắt': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118'
};

async function updateSpecialtyImages() {
    try {
        const specialties = await ChuyenKhoa.findAll();
        for (const spec of specialties) {
            const url = specialtyImages[spec.TenChuyenKhoa] || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528';
            await spec.update({ HinhAnh: url + '?auto=format&fit=crop&w=800&q=80' });
        }
        console.log('Successfully updated specialty images!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateSpecialtyImages();
