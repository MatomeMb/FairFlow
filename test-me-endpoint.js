const http = require('http');

// Use the token from the first test
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoiZGVmYXVsdCIsImlhdCI6MTc3MTcxNzA0OCwiZXhwIjoxNzc0MzA5MDQ4fQ.vwS_iR6vZO0ZPrkSOQ_drSaAFZeqJz0xz_mjVaNdU3M';

const opts = { 
  hostname: 'localhost', 
  port: 3000, 
  path: '/v1/auth/merchant/me', 
  method: 'GET', 
  headers: { Authorization: 'Bearer ' + token } 
};

http.request(opts, (res) => { 
  let d = ''; 
  res.on('data', c => d += c); 
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', d);
  }); 
}).end();
