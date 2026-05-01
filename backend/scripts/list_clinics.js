
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PhongKham = require('../models/PhongKham');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

async function listClinics() {
  try {
    await sequelize.authenticate();
    const clinics = await PhongKham.findAll();
    console.log(JSON.stringify(clinics.map(c => ({ id: c.Id_PhongKham, name: c.TenPhongKham, address: c.DiaChi })), null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listClinics();
