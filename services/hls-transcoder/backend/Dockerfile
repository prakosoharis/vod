# Multi-stage build for optimized image size
FROM node:18-alpine AS base

# Install FFmpeg and required dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    curl

# Set working directory
WORKDIR /app

# Copy package files
# Use wildcard for package-lock.json to make it optional
COPY package*.json ./

# Install dependencies
# Use npm ci for faster, reproducible builds (if package-lock.json exists)
# Falls back to npm install if package-lock.json is missing
RUN if [ -f package-lock.json ]; then \
        echo "Using npm ci (lockfile found)..." && \
        npm ci --omit=dev && npm cache clean --force; \
    else \
        echo "Using npm install (no lockfile)..." && \
        npm install --omit=dev && npm cache clean --force; \
    fi

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
