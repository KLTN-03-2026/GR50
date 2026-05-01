const { NguoiDung, BenhNhan, DatLich } = require('./models');

async function check() {
  try {
    const users = await NguoiDung.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { Ho: { [require('sequelize').Op.like]: '%Lê%' } },
          { Ten: { [require('sequelize').Op.like]: '%Nguyên%' } }
        ]
      },
      include: [{ model: BenhNhan, include: [DatLich] }]
    });

    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
