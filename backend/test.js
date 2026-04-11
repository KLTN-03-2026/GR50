try {
    const models = require('./models');
    const fs = require('fs');
    fs.writeFileSync('crash.log', 'Models loaded properly: ' + Object.keys(models).join(', '));
} catch (e) {
    const fs = require('fs');
    fs.writeFileSync('crash.log', e.stack);
}
