
const PhongKham = require('../models/PhongKham');
const sequelize = require('../config/database');

const hospitalsInDaNang = [
    {
        TenPhongKham: 'Bệnh viện Đa khoa Đà Nẵng',
        DiaChi: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng',
        UrlBanner: '/images/hinh_bv_da_khoa.jpg',
        UrlLogo: '/images/hinh_bv_da_khoa.jpg',
        ToaDo_Lat: 16.0748,
        ToaDo_Lng: 108.2163
    },
    {
        TenPhongKham: 'Bệnh viện C Đà Nẵng',
        DiaChi: '122 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng',
        UrlBanner: '/images/hinh_bv_C.jpg',
        UrlLogo: '/images/hinh_bv_C.jpg',
        ToaDo_Lat: 16.0754,
        ToaDo_Lng: 108.2172
    },
    {
        TenPhongKham: 'Bệnh viện Hoàn Mỹ Đà Nẵng',
        DiaChi: '291 Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng',
        UrlBanner: '/images/hinh_bv_hoan_my.jpg',
        UrlLogo: '/images/hinh_bv_hoan_my.jpg',
        ToaDo_Lat: 16.0592,
        ToaDo_Lng: 108.2105
    },
    {
        TenPhongKham: 'Bệnh viện Phụ sản - Nhi Đà Nẵng',
        DiaChi: '402 Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng',
        UrlBanner: '/images/hinh_bv_phu_san.jpg',
        UrlLogo: '/images/hinh_bv_phu_san.jpg',
        ToaDo_Lat: 16.0315,
        ToaDo_Lng: 108.2435
    },
    {
        TenPhongKham: 'Bệnh viện Ung bướu Đà Nẵng',
        DiaChi: 'Tổ 78, Hòa Minh, Liên Chiểu, Đà Nẵng',
        UrlBanner: '/images/hinh_bv_ung_buou.jpg',
        UrlLogo: '/images/hinh_bv_ung_buou.jpg',
        ToaDo_Lat: 16.0667,
        ToaDo_Lng: 108.1633
    }
];

async function updateClinics() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const currentClinics = await PhongKham.findAll();
        
        for (let i = 0; i < currentClinics.length; i++) {
            const currentClinic = currentClinics[i];
            const newData = hospitalsInDaNang[i % hospitalsInDaNang.length];
            
            await currentClinic.update({
                TenPhongKham: newData.TenPhongKham,
                DiaChi: newData.DiaChi,
                UrlBanner: newData.UrlBanner,
                UrlLogo: newData.UrlLogo,
                ToaDo_Lat: newData.ToaDo_Lat,
                ToaDo_Lng: newData.ToaDo_Lng
            });
            console.log(`Updated clinic ${currentClinic.Id_PhongKham} to ${newData.TenPhongKham}`);
        }

        console.log('Update completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating clinics:', error);
        process.exit(1);
    }
}

updateClinics();
