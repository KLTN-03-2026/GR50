const db = require('./backend/models');
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully with multi-facility support!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error syncing DB:', err);
    process.exit(1);
  });
