import http from 'http';

const options = {
  hostname: 'localhost',
  port: 4243,
  path: '/api/products',
  method: 'OPTIONS',
  headers: {
    Origin: 'http://localhost:5177',
    'Access-Control-Request-Method': 'GET'
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {});
  res.on('end', () => process.exit(0));
});

req.on('error', (e) => {
  console.error('problem with request:', e.message);
  process.exit(1);
});

req.end();