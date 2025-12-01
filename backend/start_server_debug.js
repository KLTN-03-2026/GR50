const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const out = fs.openSync(path.join(__dirname, 'server_debug_out.log'), 'a');
const err = fs.openSync(path.join(__dirname, 'server_debug_err.log'), 'a');

const child = spawn('node', ['server.js'], {
    detached: true,
    stdio: ['ignore', out, err],
    cwd: __dirname
});

child.unref();
console.log('Server started with PID:', child.pid);
