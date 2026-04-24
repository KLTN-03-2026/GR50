const { Appointment, NguoiDung, BenhNhan, BacSi, Clinic, DoctorSchedule } = require('./models');

async function test() {
  try {
    const apps = await Appointment.count();
    const users = await NguoiDung.count();
    const clinics = await Clinic.count();
    console.log({ apps, users, clinics });

    const firstApp = await Appointment.findOne({
      include: [
        { model: BenhNhan, include: [NguoiDung] },
        { model: DoctorSchedule, include: [{ model: BacSi, include: [NguoiDung] }] },
        { model: Clinic }
      ]
    });
    
    if (firstApp) {
      console.log('First Appointment Data:', JSON.stringify(firstApp.toJSON(), null, 2));
    } else {
      console.log('No appointments found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
