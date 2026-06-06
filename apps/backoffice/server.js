import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createProxyMiddleware } = require('http-proxy-middleware');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3006;

// API proxy - forward /api requests to API service
const apiTarget = process.env.API_SERVICE_URL || 'http://localhost:3005';
const apiProxy = createProxyMiddleware({
  target: apiTarget,
  changeOrigin: true,
  secure: false,
});
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    apiProxy(req, res, next);
  } else {
    next();
  }
});

// Serve static files from the dist directory with proper MIME types
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    } else if (filePath.endsWith('.mjs')) {
      res.set('Content-Type', 'application/javascript');
    }
  }
}));

// For all other routes, serve the index.html file
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VOD Backoffice server is running on http://localhost:${PORT}`);
});
