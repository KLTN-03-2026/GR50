const { DatLich, BusinessHourConfig, AppointmentStatusHistory, sequelize } = require('../models');
const { Op } = require('sequelize');

async function cleanupAfterBusinessHours() {
  try {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();

    console.log(`Starting cleanup for ${todayDate}...`);

    // 1. Get all facilities with active business hours
    const configs = await BusinessHourConfig.findAll({
      where: { day_of_week: dayOfWeek, is_active: true }
    });

    for (const config of configs) {
      const { facility_id, end_time } = config;
      const [endHour, endMinute] = end_time.split(':');
      
      const facilityEndTime = new Date(today);
      facilityEndTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const onlineLimitTime = new Date(today);
      onlineLimitTime.setHours(20, 30, 0, 0);

      const isPastFacilityTime = today >= facilityEndTime;
      const isPastOnlineTime = today >= onlineLimitTime;

      if (!isPastFacilityTime && !isPastOnlineTime) {
        continue;
      }

      console.log(`Processing Facility ${facility_id}...`);

      const appointments = await DatLich.findAll({
        include: [{ model: require('../models').LichKham, as: 'DoctorSchedule' }],
        where: {
          Id_PhongKham: facility_id,
          TrangThai: ['PENDING', 'CONFIRMED', 'DRAFT', 'WAITING_CONFIRMATION'],
        }
      });

      for (const apt of appointments) {
        const isOnline = apt.DoctorSchedule?.LoaiKham === 'Online';
        let shouldExpire = false;

        if (isOnline && isPastOnlineTime) shouldExpire = true;
        if (!isOnline && isPastFacilityTime) shouldExpire = true;

        if (shouldExpire) {
          const oldStatus = apt.TrangThai;
          apt.TrangThai = 'EXPIRED';
          apt.deleted_reason = isOnline ? 'Hết hạn sau 20:30' : 'Hết hạn sau giờ hành chính';
          await apt.save();
          await apt.destroy();

          await AppointmentStatusHistory.create({
            appointment_id: apt.Id_DatLich,
            old_status: oldStatus,
            new_status: 'EXPIRED',
            actor_role: 'system',
            reason: apt.deleted_reason
          });
        }
      }
    }

    console.log('Cleanup job completed.');
  } catch (error) {
    console.error('Cleanup Job Error:', error);
  } finally {
    process.exit();
  }
}

cleanupAfterBusinessHours();
