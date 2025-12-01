const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'server_wrapper_debug.log');
fs.writeFileSync(logFile, 'Starting server wrapper...\n');

const server = spawn('node', ['server.js'], { cwd: __dirname });

server.stdout.on('data', (data) => {
    fs.appendFileSync(logFile, data);
});

server.stderr.on('data', (data) => {
    fs.appendFileSync(logFile, data);
});

server.on('close', (code) => {
    fs.appendFileSync(logFile, `\nServer exited with code ${code}`);
});

console.log('Server process started');
