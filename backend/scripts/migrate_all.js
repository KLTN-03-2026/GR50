const models = require('../models');

async function migrateAll() {
    const q = models.sequelize.getQueryInterface();
    
    const migrations = [
        {
            table: 'benhnhan',
            cols: [
                { name: 'NguoiLienHe', type: 'VARCHAR(100)' },
                { name: 'SoDienThoaiLienHe', type: 'VARCHAR(20)' }
            ]
        },
        {
            table: 'datlich',
            cols: [
                { name: 'GhiChu', type: 'TEXT' },
                { name: 'LyDoHuy', type: 'TEXT' },
                { name: 'DaGuiNhac', type: 'TINYINT' },
                { name: 'GiaTien', type: 'DECIMAL(12,2)' },
                { name: 'ThoiDiemDat', type: 'DATETIME' },
                { name: 'LinkPhongHop', type: 'TEXT' },
                { name: 'LinkGhiAm', type: 'TEXT' },
                { name: 'RoomStatus', type: "ENUM('WAITING', 'ACTIVE', 'FINISHED') DEFAULT 'WAITING'" }
            ]
        },
        {
            table: 'hoadon',
            cols: [
                { name: 'Id_PhongKham', type: 'INTEGER' },
                { name: 'PhiKham', type: 'DECIMAL(12,2) DEFAULT 0' },
                { name: 'PhiDichVu', type: 'DECIMAL(12,2) DEFAULT 0' },
                { name: 'PhiThuoc', type: 'DECIMAL(12,2) DEFAULT 0' },
                { name: 'GiamGia', type: 'DECIMAL(12,2) DEFAULT 0' },
                { name: 'TrangThai', type: "ENUM('ISSUED', 'PAID', 'CANCELLED') DEFAULT 'ISSUED'" }
            ]
        }
    ];

    for (const m of migrations) {
        for (const c of m.cols) {
            try {
                await models.sequelize.query(`ALTER TABLE ${m.table} ADD COLUMN ${c.name} ${c.type}`);
                console.log(`Added ${c.name} to ${m.table}`);
            } catch(e) {
                console.log(`${c.name} in ${m.table} exists or error:`, e.message);
            }
        }
    }
    process.exit(0);
}

migrateAll();
