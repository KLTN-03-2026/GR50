try {
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync('crash_controllers.log', 'Starting...\n');
    const controllers = fs.readdirSync(path.join(__dirname, 'controllers')).filter(f => f.endsWith('.js'));
    for (const c of controllers) {
        require('./controllers/' + c);
        fs.appendFileSync('crash_controllers.log', 'Loaded ' + c + '\n');
    }
} catch (e) {
    const fs = require('fs');
    fs.appendFileSync('crash_controllers.log', 'Error:\n' + e.stack + '\n');
    process.exit(1);
}
