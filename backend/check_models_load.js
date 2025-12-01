try {
    const models = require('./models');
    console.log('Models loaded successfully');
    console.log('Conversation model:', models.Conversation);
} catch (error) {
    const fs = require('fs');
    fs.writeFileSync('backend/model_load_error.txt', 'Error loading models: ' + error.stack);
}
