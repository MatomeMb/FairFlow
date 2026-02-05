#!/usr/bin/env node
/**
 * Minimal static server for demo/ folder. No dependencies.
 * Usage: node scripts/demo-server.mjs [port]
 * Default port: 5177
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'demo');
const port = parseInt(process.argv[2] || '5177', 10);

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const file = path.join(root, path.normalize(url).replace(/^\//, ''));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      res.writeHead(500);
      res.end();
      return;
    }
    const ext = path.extname(file);
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Demo server: http://localhost:${port}`);
  console.log(`  catalog-upload: http://localhost:${port}/catalog-upload.html`);
  console.log(`  matter-demo:    http://localhost:${port}/matter-demo.html`);
});
