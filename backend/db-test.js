const fs = require('fs');
const { ChuyenKhoa } = require('./models');

ChuyenKhoa.count()
    .then(c => {
        fs.writeFileSync('db_check.log', 'COUNT: ' + c);
        process.exit(0);
    })
    .catch(e => {
        fs.writeFileSync('db_check.log', 'ERR: ' + e.stack);
        process.exit(1);
    });
