const fs = require('fs');
try {
    const content = fs.readFileSync('start_log.txt', 'utf16le');
    fs.writeFileSync('start_log_utf8.txt', content, 'utf8');
} catch (e) {
    console.error(e);
}
