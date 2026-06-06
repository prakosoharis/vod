const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Static files middleware with proper MIME types
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

// API routes proxy
const apiTarget = process.env.API_SERVICE_URL || 'http://localhost:3005';
const apiProxy = createProxyMiddleware({
  target: apiTarget,
  changeOrigin: true,
  secure: false,
});
// Use custom handler to preserve full /api path (Express app.use strips mount prefix)
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    apiProxy(req, res, next);
  } else {
    next();
  }
});

// Backoffice proxy
const backofficeTarget = process.env.BACKOFFICE_SERVICE_URL || 'http://localhost:3006';
const backofficeProxy = createProxyMiddleware({
  target: backofficeTarget,
  changeOrigin: true,
  secure: false,
});
app.use((req, res, next) => {
  if (req.url.startsWith('/backoffice')) {
    backofficeProxy(req, res, next);
  } else {
    next();
  }
});

// Always serve the index.html for any request
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');

  // Check if dist/index.html exists, otherwise serve from public directory
  const htmlPath = fs.existsSync(indexPath)
    ? indexPath
    : path.join(__dirname, 'index.html');

  res.sendFile(htmlPath);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDev ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

app.listen(port, () => {
  console.log(`🚀 MOST Web server running on port ${port}`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Access at: http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});