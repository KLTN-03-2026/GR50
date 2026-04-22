const sequelize = require('./config/database');

async function check() {
  const [results] = await sequelize.query('DESCRIBE ThongBao');
  console.log(results);
  process.exit();
}

check();
