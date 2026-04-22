const { DatLich, BenhNhan, LichKham, BacSi, NguoiDung } = require('./models');

async function test() {
  const apps = await DatLich.findAll({
    include: [
      { model: BenhNhan, include: [{ model: NguoiDung }] },
      { 
        model: LichKham, 
        include: [{ model: BacSi, include: [{ model: NguoiDung }] }] 
      }
    ],
    limit: 5
  });
  console.log("Appointments:");
  apps.forEach(a => {
    console.log(`ID: ${a.Id_DatLich}, Patient: ${a.BenhNhan?.NguoiDung?.Ho} ${a.BenhNhan?.NguoiDung?.Ten}, Doctor: ${a.LichKham?.BacSi?.NguoiDung?.Ho} ${a.LichKham?.BacSi?.NguoiDung?.Ten}, BacSi_Id_NguoiDung: ${a.LichKham?.BacSi?.Id_NguoiDung}`);
  });
  process.exit();
}

test().catch(console.error);
