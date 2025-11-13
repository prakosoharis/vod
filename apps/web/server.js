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

// API routes proxy (untuk development)
if (isDev) {
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    secure: false,
  }));
}

// Backoffice proxy (untuk production dan development)
app.use('/backoffice', createProxyMiddleware({
  target: 'http://localhost:3006',
  changeOrigin: true,
  pathRewrite: {
    '^/backoffice': '',
  },
  secure: false,
}));

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