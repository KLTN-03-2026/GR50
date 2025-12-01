const { exec } = require('child_process');
const fs = require('fs');

exec('netstat -ano | findstr :8050', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    fs.writeFileSync('pid_check.txt', stdout);
});
