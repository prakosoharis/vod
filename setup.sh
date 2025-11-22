#!/bin/bash

# Setup script for Alkamus VOD project
# Works for both local and server environments

echo "🚀 Setting up Alkamus VOD project..."

# Check environment type
if [ "$1" = "production" ]; then
    echo "📍 Production environment detected"

    # Install dependencies for all apps
    echo "📦 Installing API dependencies..."
    cd apps/api && CI=true pnpm install --ignore-scripts --frozen-lockfile
    # Install additional dependencies for upload functionality
    pnpm add @fastify/static @fastify/multipart uuid
    pnpm add -D @types/uuid
    pnpm prisma generate
    pnpm build

    echo "📦 Installing Web dependencies..."
    cd ../web && CI=true pnpm install --ignore-scripts --frozen-lockfile
    pnpm build

    echo "📦 Installing Backoffice dependencies..."
    cd ../backoffice && CI=true npm install
    # Install additional dependencies for upload functionality
    npm install react-dropzone
    npm install express
    npm run build

    cd ../..

    # Setup PM2 if not already running
    if ! pm2 list | grep -q "alkamus-api" || ! pm2 list | grep -q "alkamus-backoffice"; then
        echo "🔧 Setting up PM2 processes..."
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
    else
        echo "🔄 Restarting PM2 processes..."
        pm2 restart all
    fi

    echo "✅ Production setup complete!"
    echo "🌐 API: http://localhost:3005"
    echo "🌐 Web: http://localhost (via reverse proxy)"
    echo "🌐 Backoffice: http://localhost:3006"
    echo "🖼️  Upload system ready! Access dashboard at:"
    echo "   Backoffice: http://localhost:3006 -> Upload Assets menu"

elif [ "$1" = "development" ]; then
    echo "📍 Development environment detected"

    # Install dependencies for all apps
    echo "📦 Installing API dependencies..."
    cd apps/api && pnpm install
    # Install additional dependencies for upload functionality
    pnpm add @fastify/static @fastify/multipart uuid
    pnpm add -D @types/uuid
    pnpm prisma generate

    echo "📦 Installing Web dependencies..."
    cd ../web && pnpm install

    echo "📦 Installing Backoffice dependencies..."
    cd ../backoffice && npm install
    # Install additional dependencies for upload functionality
    npm install react-dropzone

    cd ../..

    echo "✅ Development setup complete!"
    echo "🔧 To start development servers:"
    echo "   API: cd apps/api && pnpm dev (port 3005)"
    echo "   Web: cd apps/web && pnpm dev (port 5173)"
    echo "   Backoffice: cd apps/backoffice && npm run dev (port 3006)"
    echo ""
    echo "🖼️  Upload system ready! Access dashboard at:"
    echo "   Backoffice: http://localhost:3006 -> Upload Assets menu"
    echo ""
    echo "🐳 To start database (if needed):"
    echo "   docker-compose up -d"

elif [ "$1" = "upload-setup" ]; then
    echo "📍 Upload-only setup detected"

    # Install only upload dependencies
    echo "📦 Installing API upload dependencies..."
    cd apps/api && pnpm add @fastify/static @fastify/multipart uuid && pnpm add -D @types/uuid
    pnpm prisma generate

    echo "📦 Installing Backoffice upload dependencies..."
    cd ../backoffice && npm install react-dropzone

    echo "🖼️  Upload dependencies installed!"

    # Run database migration if database is available
    echo "🗄️  Running database migration..."
    if cd apps/api && pnpm prisma migrate dev --name add_upload_fields; then
        echo "✅ Database migration completed successfully!"
    else
        echo "⚠️  Database migration failed. Please run manually:"
        echo "   cd apps/api && pnpm prisma migrate dev --name add_upload_fields"
    fi
    cd ../..

else
    echo "❌ Usage: ./setup.sh [production|development|upload-setup]"
    echo ""
    echo "Options:"
    echo "  production   - Full production build with all optimizations"
    echo "  development  - Development setup with dev dependencies"
    echo "  upload-setup - Install only upload-related dependencies"
    exit 1
fi

echo "🎉 Setup completed successfully!"