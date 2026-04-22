const { AITuVanPhien, BacSi, NguoiDung } = require('./models');

async function test() {
  const sessions = await AITuVanPhien.findAll();
  console.log('Total AI Sessions:', sessions.length);
  sessions.forEach(s => {
    console.log(`- ID: ${s.Id_AITuVanPhien}, User: ${s.Id_NguoiDung}, Doctor: ${s.Id_BacSi_PhuTrach}, Status: ${s.TrangThaiChuyenGiao}`);
  });
  
  const doctor = await BacSi.findOne({ where: { Id_NguoiDung: 2 } });
  console.log('Doctor ID for User 2 (Nguyễn Lân Việt):', doctor?.Id_BacSi);
  process.exit();
}

test().catch(console.error);
