const { sequelize } = require('./models');

async function checkThanhToan() {
  try {
    const [results] = await sequelize.query("DESCRIBE thanhtoan");
    console.log("ThanhToan structure:", JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

checkThanhToan();
