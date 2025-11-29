const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('./server_out.log', 'w');
const err = fs.openSync('./server_err.log', 'w');

const subprocess = spawn('node', ['server.js'], {
    detached: true,
    stdio: ['ignore', out, err]
});

subprocess.unref();
console.log('Server started with PID:', subprocess.pid);
