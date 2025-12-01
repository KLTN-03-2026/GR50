const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:8001/api/auth/login', {
            login: 'admin@medischedule.com',
            password: '12345678' // Assuming this is the password from README
        });
        console.log('Login successful:', response.data);
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
