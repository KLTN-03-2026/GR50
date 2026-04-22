const { ThongBao } = require('./models');

async function test() {
  try {
    const data = await ThongBao.findAll({ limit: 1 });
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit();
}

test();
