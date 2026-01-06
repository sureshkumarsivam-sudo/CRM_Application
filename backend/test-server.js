const express = require('express');
const app = express();
const PORT = 5002;

app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.json({ message: 'Server is working!' });
});

app.get('/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.json({ message: 'Test successful', timestamp: new Date() });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Simple test server running on http://127.0.0.1:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGTERM', () => {
  server.close();
});