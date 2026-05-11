const { AppointmentDailySnapshot, AppointmentMonthlyReport, DatLich, PhongKham, BacSi, sequelize } = require('../models');
const { Op } = require('sequelize');

async function generateDailySnapshots() {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        console.log(`Generating snapshots for ${dateStr}...`);

        const facilities = await PhongKham.findAll();
        for (const fac of facilities) {
            const doctors = await BacSi.findAll(); // simplified
            for (const doc of doctors) {
                const stats = await DatLich.findAll({
                    where: {
                        Id_PhongKham: fac.Id_PhongKham,
                        Id_BacSi: doc.Id_BacSi,
                        NgayTao: { [Op.startsWith]: dateStr }
                    }
                });

                if (stats.length === 0) continue;

                const completed = stats.filter(s => s.TrangThai === 'COMPLETED').length;
                const cancelled = stats.filter(s => s.TrangThai === 'CANCELLED' || s.TrangThai === 'EXPIRED').length;
                const noShow = stats.filter(s => s.TrangThai === 'NO_SHOW').length;
                const totalRevenue = stats.reduce((sum, s) => sum + (Number(s.GiaTien) || 0), 0);

                await AppointmentDailySnapshot.create({
                    facility_id: fac.Id_PhongKham,
                    doctor_id: doc.Id_BacSi,
                    snapshot_date: dateStr,
                    total_appointments: stats.length,
                    completed_appointments: completed,
                    cancelled_appointments: cancelled,
                    no_show_appointments: noShow,
                    total_revenue: totalRevenue,
                    avg_wait_time: 15 // Mock for now
                });
            }
        }
        console.log('Daily snapshots generated.');
    } catch (error) {
        console.error('Daily Snapshot Error:', error);
    }
}

async function generateMonthlyReport() {
    // Similar logic for monthly aggregation
    console.log('Generating monthly report...');
    // ... logic to aggregate snapshots into AppointmentMonthlyReport
}

async function run() {
    await generateDailySnapshots();
    await generateMonthlyReport();
    process.exit();
}

run();
