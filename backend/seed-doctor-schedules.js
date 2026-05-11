const { 
    BacSi, 
    PhongKham, 
    BacSi_PhongKham, 
    DoctorFacilitySchedule, 
    DoctorOnlineSchedule,
    NguoiDung,
    sequelize 
} = require('./models');

async function seedSchedules() {
    try {
        console.log('Starting schedule seeding...');
        
        // 1. Get all doctors with their users and facilities
        const doctors = await BacSi.findAll({
            include: [
                { model: NguoiDung },
                { model: PhongKham, as: 'facilities' }
            ]
        });

        console.log(`Found ${doctors.length} doctors to process.`);

        const facilitySchedules = [];
        const onlineSchedules = [];

        // Admin ID for assignment (fallback to first admin or doctor themselves)
        const fallbackAdminId = 1;

        for (const doctor of doctors) {
            const doctorId = doctor.Id_BacSi;
            const userId = doctor.Id_NguoiDung;
            const specialtyId = doctor.Id_ChuyenKhoa;
            const facilities = doctor.facilities || [];

            if (facilities.length === 0) {
                console.log(`Doctor ${doctor.NguoiDung.Ho} ${doctor.NguoiDung.Ten} has no assigned facilities. Skipping facility schedule.`);
            }

            // Create Facility Schedules (Offline)
            // Mon (1) to Fri (5)
            for (let day = 1; day <= 5; day++) {
                // If doctor has multiple facilities, alternate or assign to first
                const targetFacility = facilities[day % facilities.length] || facilities[0];
                
                if (targetFacility) {
                    // Morning Shift
                    facilitySchedules.push({
                        doctorId,
                        facilityId: targetFacility.Id_PhongKham,
                        specialtyId,
                        roomId: `Room ${100 + doctorId}`,
                        dayOfWeek: day,
                        startTime: '08:00:00',
                        endTime: '11:30:00',
                        assignedByAdminId: fallbackAdminId,
                        status: 'ACTIVE',
                        effectiveFrom: '2026-01-01',
                        effectiveTo: '2026-12-31'
                    });

                    // Afternoon Shift
                    facilitySchedules.push({
                        doctorId,
                        facilityId: targetFacility.Id_PhongKham,
                        specialtyId,
                        roomId: `Room ${100 + doctorId}`,
                        dayOfWeek: day,
                        startTime: '13:30:00',
                        endTime: '17:00:00',
                        assignedByAdminId: fallbackAdminId,
                        status: 'ACTIVE',
                        effectiveFrom: '2026-01-01',
                        effectiveTo: '2026-12-31'
                    });
                }
            }

            // Create Online Schedules (Evening)
            // Mon (1) to Sat (6)
            for (let day = 1; day <= 6; day++) {
                onlineSchedules.push({
                    doctorId,
                    dayOfWeek: day,
                    startTime: '19:00:00',
                    endTime: '21:00:00',
                    slotDuration: 20,
                    maxOnlineBookings: 8,
                    status: 'OPEN',
                    createdByDoctorId: userId
                });
            }
        }

        // Clear existing to avoid duplicates if needed, or just bulk create
        // await DoctorFacilitySchedule.destroy({ where: {} });
        // await DoctorOnlineSchedule.destroy({ where: {} });

        if (facilitySchedules.length > 0) {
            await DoctorFacilitySchedule.bulkCreate(facilitySchedules);
            console.log(`Created ${facilitySchedules.length} facility schedules.`);
        }

        if (onlineSchedules.length > 0) {
            await DoctorOnlineSchedule.bulkCreate(onlineSchedules);
            console.log(`Created ${onlineSchedules.length} online schedules.`);
        }

        console.log('Schedule seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding schedules:', error);
        process.exit(1);
    }
}

seedSchedules();
