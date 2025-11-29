const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); 

const PORT = 5500;
const publicDir = path.join(__dirname);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {

  // Fix: remove query parameters like ?courseId=33
  const parsed = url.parse(req.url);
  const cleanPath = parsed.pathname;

  // Use cleaned path instead of req.url
  let filePath = path.join(publicDir, cleanPath === '/' ? 'index.html' : cleanPath);

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});
