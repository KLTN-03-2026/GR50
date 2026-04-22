const { AITuVanPhien } = require('./models');

async function assign() {
  await AITuVanPhien.update(
    { Id_BacSi_PhuTrach: 1, TrangThaiChuyenGiao: 'assigned' },
    { where: { Id_AITuVanPhien: [1, 2] } }
  );
  console.log('Successfully assigned sessions 1 and 2 to Doctor 1.');
  process.exit();
}

assign().catch(console.error);
