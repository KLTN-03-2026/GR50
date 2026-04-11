const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log('Error: GEMINI_API_KEY not found in .env');
            return;
        }
        console.log('Testing with API Key ending in: ' + apiKey.slice(-4));

        // Explicit proxy handling? Try a basic fetch first.
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('Generating content...');
        const result = await model.generateContent('hi');
        const text = result.response.text();
        console.log('Success:', text);
    } catch (err) {
        console.error('API Error Details:');
        console.error({
            message: err.message,
            status: err.status,
            details: err.details
        });
    }
}

test();
