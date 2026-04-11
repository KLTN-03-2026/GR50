const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
    fs.writeFileSync('crash.log', 'UNCAUGHT: ' + err.stack);
    process.exit(1);
});

try {
    require('./server');
    setTimeout(() => process.exit(0), 1000); // 1 sec delay to check if async init throws
} catch (e) {
    fs.writeFileSync('crash.log', 'SYNC: ' + e.stack);
    process.exit(1);
}
