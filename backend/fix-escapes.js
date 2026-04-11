const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(dir);
for (const f of files) {
    if (f.endsWith('.js')) {
        const p = path.join(dir, f);
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
        fs.writeFileSync(p, content);
    }
}
console.log('Fixed escapes');
