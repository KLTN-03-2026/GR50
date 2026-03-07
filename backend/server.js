const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/specialties', require('./routes/specialtyRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/profile', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));

// Database connection and server start
const fs = require('fs');
const logFile = 'server_debug.log';

sequelize.sync({ force: true })   // Use force:true to recreate SQLite DB every time
  .then(async () => {
    console.log('Database connected and synced (SQLite in-memory)...');
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Database connected and synced...\n`);

    // Auto-seed data
    console.log('Starting data injection (seeding)...');
    const seed = require('./seed');
    try {
      await seed();
      console.log('Data injection completed.');
    } catch (seedErr) {
      console.error('Data injection failed:', seedErr);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Server running on port ${PORT}\n`);
    });
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Error connecting to database: ${err.message}\n${err.stack}\n`);
  });
