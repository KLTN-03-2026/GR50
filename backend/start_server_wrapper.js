const { spawn } = require('child_process');
const fs = require('fs');

const server = spawn('node', ['server.js'], { cwd: __dirname });

const logStream = fs.createWriteStream('server_wrapper.log');

server.stdout.pipe(logStream);
server.stderr.pipe(logStream);

server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    fs.appendFileSync('server_wrapper.log', `\nServer exited with code ${code}`);
});
