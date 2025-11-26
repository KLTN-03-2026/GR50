const { sequelize, User, Specialty, Doctor, Patient, Appointment, AdminPermission, Payment } = require('./models');
const { fakerVI: faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true }); // Reset database
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database synced!');

    // Specialties
    const specialtiesData = [
      { name: 'Tim mạch', description: 'Chuyên khoa về tim và mạch máu' },
      { name: 'Nội khoa', description: 'Chuyên khoa nội tổng quát' },
      { name: 'Ngoại khoa', description: 'Phẫu thuật và điều trị ngoại khoa' },
      { name: 'Nhi khoa', description: 'Chăm sóc sức khỏe trẻ em' },
      { name: 'Sản phụ khoa', description: 'Sức khỏe phụ nữ và sinh sản' },
      { name: 'Răng hàm mặt', description: 'Nha khoa và phẫu thuật hàm mặt' },
      { name: 'Da liễu', description: 'Các bệnh về da' },
      { name: 'Mắt', description: 'Nhãn khoa' },
      { name: 'Tai Mũi Họng', description: 'Bệnh lý tai mũi họng' },
      { name: 'Thần kinh', description: 'Bệnh lý hệ thần kinh' }
    ];

    const specialties = await Specialty.bulkCreate(specialtiesData);
    console.log('Specialties created');

    const passwordHash = await bcrypt.hash('12345678', 10);

    // Admin
    const adminUser = await User.create({
      email: 'admin@medischedule.com',
      username: 'admin',
      password: passwordHash,
      full_name: 'Quản Trị Viên',
      role: 'admin',
      phone: '0901234567',
      address: 'Hà Nội, Việt Nam'
    });
    
    await AdminPermission.create({
      user_id: adminUser.id,
      can_manage_doctors: true,
      can_manage_patients: true,
      can_manage_appointments: true,
      can_view_stats: true,
      can_manage_specialties: true,
      can_create_admins: true
    });
    console.log('Admin created');

    // Department Head
    await User.create({
      email: 'departmenthead@test.com',
      username: 'depthead',
      password: passwordHash,
      full_name: 'Trưởng Khoa',
      role: 'department_head',
      phone: '0909999999',
      address: 'Hà Nội, Việt Nam'
    });
    console.log('Department Head created');

    // Doctors
    const doctors = [];
    for (let i = 0; i < 20; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `BS. ${lastName} ${firstName}`;
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      const user = await User.create({
        email: `doctor${i+1}@test.com`,
        username: `doctor${i+1}`,
        password: passwordHash,
        full_name: fullName,
        role: 'doctor',
        phone: faker.phone.number('09########'),
        address: faker.location.streetAddress(),
        date_of_birth: faker.date.birthdate({ min: 30, max: 60, mode: 'age' })
      });

      const doctor = await Doctor.create({
        user_id: user.id,
        specialty_id: specialty.id,
        experience_years: faker.number.int({ min: 2, max: 30 }),
        consultation_fee: faker.number.int({ min: 200, max: 1000 }) * 1000,
        bio: `Bác sĩ ${fullName} là một chuyên gia hàng đầu trong lĩnh vực ${specialty.name} với nhiều năm kinh nghiệm.`,
        status: 'approved'
      });
      doctors.push(doctor);
    }
    console.log('Doctors created');

    // Patients
    const patients = [];
    for (let i = 0; i < 50; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      const user = await User.create({
        email: `patient${i+1}@test.com`,
        username: `patient${i+1}`,
        password: passwordHash,
        full_name: `${lastName} ${firstName}`,
        role: 'patient',
        phone: faker.phone.number('09########'),
        address: faker.location.streetAddress(),
        date_of_birth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' })
      });

      const patient = await Patient.create({
        user_id: user.id
      });
      patients.push(patient);
    }
    console.log('Patients created');

    // Appointments
    for (let i = 0; i < 100; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      // Random date within last month and next month
      const date = faker.date.between({ from: new Date(Date.now() - 30*24*60*60*1000), to: new Date(Date.now() + 30*24*60*60*1000) });
      
      // Random time between 8:00 and 17:00
      const hour = faker.number.int({ min: 8, max: 16 });
      const minute = faker.number.int({ min: 0, max: 1 }) * 30; // 00 or 30
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

      let status = 'pending';
      if (date < new Date()) {
        status = faker.helpers.arrayElement(['completed', 'cancelled']);
      } else {
        status = faker.helpers.arrayElement(['pending', 'confirmed']);
      }

      const symptomsList = [
        'Đau đầu, chóng mặt',
        'Sốt cao, ho nhiều',
        'Đau bụng dữ dội',
        'Mệt mỏi, chán ăn',
        'Khó thở, tức ngực',
        'Đau nhức xương khớp',
        'Nổi mẩn ngứa',
        'Mất ngủ kéo dài',
        'Đau răng, sưng lợi',
        'Mờ mắt, đau mắt'
      ];

      await Appointment.create({
        patient_id: patient.user_id,
        doctor_id: doctor.user_id,
        appointment_date: date,
        appointment_time: time,
        symptoms: faker.helpers.arrayElement(symptomsList),
        status: status
      });
    }
    console.log('Appointments created');

    // Payments
    const allAppointments = await Appointment.findAll();
    for (const appt of allAppointments) {
      if (appt.status === 'completed' || appt.status === 'confirmed') {
        const doctor = await Doctor.findOne({ where: { user_id: appt.doctor_id } });
        const fee = doctor ? doctor.consultation_fee : 500000;
        
        // 70% chance of having a payment record
        if (Math.random() > 0.3) {
           await Payment.create({
            appointment_id: appt.id,
            patient_id: appt.patient_id,
            amount: fee,
            payment_method: faker.helpers.arrayElement(['mock_card', 'mock_wallet', 'mock_bank']),
            transaction_id: faker.string.uuid(),
            status: appt.status === 'completed' ? 'completed' : 'pending',
            payment_date: appt.status === 'completed' ? appt.appointment_date : null
          });
        }
      }
    }
    console.log('Payments created');

    // Conversations & Messages
    const { Conversation, Message } = require('./models');
    
    // Create a conversation between patient1 and doctor1
    const patient1 = patients[0];
    const doctor1 = doctors[0];
    
    if (patient1 && doctor1) {
      const conversation = await Conversation.create({
        patient_id: patient1.user_id,
        doctor_id: doctor1.user_id,
        status: 'active'
      });

      await Message.create({
        conversation_id: conversation.id,
        sender_id: doctor1.user_id,
        message: `Xin chào ${patient1.User?.full_name || 'bạn'}, tôi có thể giúp gì cho bạn?`,
        is_read: true
      });

      await Message.create({
        conversation_id: conversation.id,
        sender_id: patient1.user_id,
        message: 'Chào bác sĩ, tôi muốn hỏi về lịch khám.',
        is_read: true
      });
      
      console.log('Sample conversation created');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
