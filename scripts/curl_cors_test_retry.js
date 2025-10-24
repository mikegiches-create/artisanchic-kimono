import http from 'http';

const origin = 'http://localhost:5177';
const maxAttempts = 12;
let attempt = 0;

function tryRequest() {
  attempt++;
  const options = {
    hostname: 'localhost',
    port: 4243,
    path: '/api/products',
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'GET'
    },
    timeout: 2000
  };

  const req = http.request(options, (res) => {
    console.log('Attempt', attempt, 'STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    res.on('data', () => {});
    res.on('end', () => process.exit(0));
  });

  req.on('error', (e) => {
    console.error('Attempt', attempt, 'error:', e.message);
    if (attempt < maxAttempts) {
      setTimeout(tryRequest, 500);
    } else {
      process.exit(1);
    }
  });

  req.end();
}

tryRequest();
