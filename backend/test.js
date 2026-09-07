const http = require('http');

const data = JSON.stringify({ jobTitle: 'React Developer', skills: 'React' });

const req = http.request('http://127.0.0.1:5000/api/ai/generate-from-skills', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
