import http from 'http';

const options = {
  hostname: 'localhost',
  port: 4243,
  path: '/api/auth/me',
  method: 'GET',
  headers: {
    Accept: 'application/json',
    Origin: 'http://localhost:5173'
  }
};

const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  console.log('headers', res.headers);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('body', data));
});

req.on('error', (err) => console.error('request error', err.message));
req.end();
