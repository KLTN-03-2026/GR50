const { sequelize } = require('./models');

async function checkSchema() {
  try {
    const [results] = await sequelize.query("SHOW TABLES");
    console.log("Tables in database:", results.map(r => Object.values(r)[0]));

    const [callSessions] = await sequelize.query("DESCRIBE call_sessions");
    console.log("\ncall_sessions columns:");
    console.table(callSessions);

    const [callParticipants] = await sequelize.query("DESCRIBE call_participants");
    console.log("\ncall_participants columns:");
    console.table(callParticipants);

    const [conversations] = await sequelize.query("DESCRIBE conversations");
    console.log("\nconversations columns:");
    console.table(conversations);

  } catch (err) {
    console.error("Error checking schema:", err);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
