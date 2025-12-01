console.log("Hello world");
const { sequelize } = require('./models');
console.log("Models loaded");
sequelize.authenticate().then(() => {
    console.log("DB Connected");
    process.exit(0);
}).catch(err => {
    console.error("DB Error", err);
    process.exit(1);
});
