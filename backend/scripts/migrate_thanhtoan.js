const m = require('../models');
async function run() {
    const cols = [
        { n: 'Id_DatLich', t: 'INTEGER' },
        { n: 'Id_BenhNhan', t: 'INTEGER' },
        { n: 'Id_PhongKham', t: 'INTEGER' },
        { n: 'MaDonHang', t: 'VARCHAR(100)' },
        { n: 'MoTa', t: 'TEXT' },
        { n: 'NgayCapNhat', t: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];
    for (const c of cols) {
        try {
            await m.sequelize.query(`ALTER TABLE thanhtoan ADD COLUMN ${c.n} ${c.t}`);
            console.log('Added', c.n);
        } catch(e) {
            console.log(c.n, 'exists/err');
        }
    }
    process.exit(0);
}
run();
