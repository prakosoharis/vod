#!/bin/bash

# Setup script for Alkamus VOD project
# Works for both local and server environments

echo "🚀 Setting up Alkamus VOD project..."

# Check if we're in production (server) environment
if [ "$NODE_ENV" = "production" ] || [ "$1" = "production" ]; then
    echo "📍 Production environment detected"

    # Install dependencies for both apps
    echo "📦 Installing API dependencies..."
    cd apps/api && CI=true pnpm install --ignore-scripts --frozen-lockfile
    pnpm prisma generate
    pnpm build

    echo "📦 Installing Web dependencies..."
    cd ../web && CI=true pnpm install --ignore-scripts --frozen-lockfile
    pnpm build

    cd ../..

    # Setup PM2 if not already running
    if ! pm2 list | grep -q "alkamus-api"; then
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

else
    echo "📍 Development environment detected"

    # Install dependencies for both apps
    echo "📦 Installing API dependencies..."
    cd apps/api && pnpm install
    pnpm prisma generate

    echo "📦 Installing Web dependencies..."
    cd ../web && pnpm install

    cd ../..

    echo "✅ Development setup complete!"
    echo "🔧 To start development servers:"
    echo "   API: cd apps/api && pnpm dev"
    echo "   Web: cd apps/web && pnpm dev"
    echo ""
    echo "🐳 To start database (if needed):"
    echo "   docker-compose up -d"
fi

echo "🎉 Setup completed successfully!"