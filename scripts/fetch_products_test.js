import fetch from 'node-fetch';

(async () => {
  try {
    const res = await fetch('http://localhost:4243/api/products');
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text.slice(0, 1000));
  } catch (err) {
    console.error('request error', err.message);
  }
})();