const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function test() {
    const { Conversation } = require('../models');
    try {
        console.log('Fetching Conversation...');
        await Conversation.findAll({ limit: 1 });
        console.log('Conversation success');
    } catch (error) {
        console.error('Error in Conversation:', error);
    }
    process.exit(0);
}
test();
