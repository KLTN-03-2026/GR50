const API = 'http://192.168.3.6:8002/api';

async function testPublicAPIs() {
  const endpoints = ['specialties', 'clinics', 'doctors'];
  
  for (const ep of endpoints) {
    try {
      console.log(`Testing /api/${ep}...`);
      const res = await fetch(`${API}/${ep}`);
      const data = await res.json();
      console.log(`- Status: ${res.status}`);
      console.log(`- Count: ${data.length}`);
      if (data.length > 0) {
        console.log(`- Sample:`, JSON.stringify(data[0]).substring(0, 100));
      }
    } catch (error) {
      console.error(`- Error testing /api/${ep}:`, error.message);
    }
  }
}

testPublicAPIs();
