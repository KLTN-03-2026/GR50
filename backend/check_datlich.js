const { sequelize } = require('./models');

async function checkDatLich() {
  try {
    const [results1] = await sequelize.query("DESCRIBE datlich");
    console.log("DatLich TrangThai:", results1.find(r => r.Field === 'TrangThai').Type);
    
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

checkDatLich();
