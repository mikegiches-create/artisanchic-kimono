import http from 'http';

const options = {
  hostname: 'localhost',
  port: 4243,
  path: '/api/products',
  method: 'GET',
  headers: {
    Accept: 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  console.log('headers', res.headers);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('body length', data.length);
    console.log(data.slice(0, 1000));
  });
});

req.on('error', (err) => console.error('request error', err.message));
req.end();
