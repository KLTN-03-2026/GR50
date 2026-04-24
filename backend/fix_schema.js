const { sequelize } = require('./models');

async function fixSchema() {
  try {
    const [results] = await sequelize.query("DESCRIBE datlich");
    const columns = results.map(r => r.Field);
    
    if (!columns.includes('BookingSource')) {
      console.log("Adding BookingSource column...");
      await sequelize.query("ALTER TABLE datlich ADD COLUMN BookingSource ENUM('AUTHENTICATED', 'GUEST') DEFAULT 'AUTHENTICATED'");
    }
    
    if (!columns.includes('IdentityStatus')) {
      console.log("Adding IdentityStatus column...");
      await sequelize.query("ALTER TABLE datlich ADD COLUMN IdentityStatus ENUM('VERIFIED_ACCOUNT', 'VERIFIED_GUEST', 'UNVERIFIED_GUEST') DEFAULT 'VERIFIED_ACCOUNT'");
    }

    const [authResults] = await sequelize.query("DESCRIBE authtokens");
    const authColumns = authResults.map(r => r.Field);
    if (!authColumns.includes('ReferenceId')) {
        console.log("Adding ReferenceId column to authtokens...");
        await sequelize.query("ALTER TABLE authtokens ADD COLUMN ReferenceId INT");
    }

    console.log("Schema fix completed.");
    process.exit(0);
  } catch (error) {
    console.error("Schema fix failed:", error);
    process.exit(1);
  }
}

fixSchema();
