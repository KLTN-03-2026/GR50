const { sequelize } = require('./models');

async function checkLichKham() {
  try {
    const [results] = await sequelize.query("DESCRIBE lichkham");
    console.log("LichKham structure:", JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

checkLichKham();
