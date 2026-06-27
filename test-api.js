// test-api.js - Test the API directly
const https = require('https');
const http = require('http');

// Get token from localStorage equivalent - we'll test without auth first
const options = {
    hostname: 'localhost',
    port: 5500,
    path: '/api/employees',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.get(options, (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.end();
