const axios = require('axios');
const { NguoiDung } = require('./models');
const jwt = require('jsonwebtoken');

async function test() {
  const doctor = await NguoiDung.findByPk(2); // ID 2 is Nguyễn Lân Việt
  const token = jwt.sign({ sub: doctor.Id_NguoiDung }, 'super_secret_jwt_key_123', { expiresIn: '1d' });
  
  try {
    console.log('Sending request...');
    const res = await axios.post('http://localhost:8002/api/conversations/appointments/5/conversation', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error:', err.response?.status, err.response?.data);
  }
}
test();
