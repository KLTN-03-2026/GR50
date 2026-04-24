const models = require('../models');

async function migrate() {
    try {
        const queryInterface = models.sequelize.getQueryInterface();
        
        console.log('Starting migration...');

        // Add columns to bacsi table
        const bacsiColumns = [
            { name: 'SoNamKinhNghiem', type: 'INTEGER' },
            { name: 'PhiTuVan', type: 'DECIMAL(12, 2)' },
            { name: 'ThoiLuongKham', type: 'INTEGER', defaultValue: 30 },
            { name: 'SoLuongKhachMacDinh', type: 'INTEGER', defaultValue: 10 },
            { name: 'GioiThieu', type: 'TEXT' },
            { name: 'HocHamHocVi', type: 'STRING(150)' },
            { name: 'NoiLamViec', type: 'STRING(255)' },
            { name: 'LichLamViec', type: 'TEXT' },
            { name: 'TrangThai', type: "ENUM('HoatDong', 'NgungHoatDong')", defaultValue: 'HoatDong' }
        ];

        for (const col of bacsiColumns) {
            try {
                await queryInterface.addColumn('bacsi', col.name, {
                    type: models.sequelize.Sequelize[col.type.split('(')[0]],
                    allowNull: true,
                    defaultValue: col.defaultValue
                });
                console.log(`Added column ${col.name} to bacsi table.`);
            } catch (e) {
                console.log(`Column ${col.name} already exists or error: ${e.message}`);
            }
        }

        // Add columns to PhongKham table if missing
        const pkColumns = [
            { name: 'UrlLogo', type: 'STRING(500)' },
            { name: 'UrlBanner', type: 'STRING(500)' },
            { name: 'GoogleMapUrl', type: 'TEXT' },
            { name: 'MaCoSo', type: 'STRING(50)' },
            { name: 'KinhDo', type: 'DECIMAL(10, 8)' },
            { name: 'ViDo', type: 'DECIMAL(10, 8)' },
            { name: 'GioHoatDong', type: 'TEXT' }
        ];

        for (const col of pkColumns) {
            try {
                await queryInterface.addColumn('PhongKham', col.name, {
                    type: models.sequelize.Sequelize[col.type.split('(')[0]],
                    allowNull: true
                });
                console.log(`Added column ${col.name} to PhongKham table.`);
            } catch (e) {
                console.log(`Column ${col.name} already exists or error: ${e.message}`);
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
