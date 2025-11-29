const fs = require('fs');
try {
    require('./routes/authRoutes');
    require('./routes/specialtyRoutes');
    require('./routes/doctorRoutes');
    require('./routes/userRoutes');
    require('./routes/appointmentRoutes');
    require('./routes/paymentRoutes');
    require('./routes/conversationRoutes');
    require('./routes/chatRoutes');
    require('./routes/patientRoutes');
    require('./routes/aiRoutes');
    fs.writeFileSync('routes_result.txt', 'Routes loaded successfully');
} catch (e) {
    fs.writeFileSync('routes_result.txt', 'Routes load failed: ' + e.message + '\nStack: ' + e.stack);
}
