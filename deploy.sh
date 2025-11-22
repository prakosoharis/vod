#!/bin/bash

# Deploy script for Alkamus VOD project
# Production deployment script

echo "🚀 Starting Alkamus VOD deployment..."

# Check if running as root or with sudo for production
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Warning: Not running as root. Some operations might require sudo."
fi

# Set working directory
WORK_DIR="/var/www/vod"
echo "📁 Working directory: $WORK_DIR"

# Create working directory if it doesn't exist
if [ ! -d "$WORK_DIR" ]; then
    echo "📂 Creating working directory..."
    sudo mkdir -p $WORK_DIR
    sudo chown $USER:$USER $WORK_DIR
fi

# Navigate to working directory
cd $WORK_DIR

# Pull latest changes if git repository
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
else
    echo "⚠️  Not a git repository. Please clone the repository first."
    echo "   git clone <repository-url> $WORK_DIR"
    exit 1
fi

# Run setup script for production
echo "🔧 Running production setup..."
./setup.sh production

# Ensure log directories exist
echo "📝 Creating log directories..."
sudo mkdir -p /var/log
sudo touch /var/log/streamkita-api-error.log
sudo touch /var/log/streamkita-api-out.log
sudo touch /var/log/streamkita-api-combined.log
sudo touch /var/log/streamkita-web-error.log
sudo touch /var/log/streamkita-web-out.log
sudo touch /var/log/streamkita-web-combined.log
sudo touch /var/log/streamkita-backoffice-error.log
sudo touch /var/log/streamkita-backoffice-out.log
sudo touch /var/log/streamkita-backoffice-combined.log

# Set proper permissions
sudo chown $USER:$USER /var/log/streamkita-*.log

# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "🌐 Installing nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Copy nginx configuration if available
if [ -f "nginx-templates/vod-nginx.conf" ]; then
    echo "⚙️  Setting up nginx configuration..."
    sudo cp nginx-templates/vod-nginx.conf /etc/nginx/sites-available/vod
    sudo ln -sf /etc/nginx/sites-available/vod /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# Setup PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Start/Restart PM2 processes
echo "🔄 Starting PM2 processes..."
if pm2 list | grep -q "alkamus"; then
    echo "🔄 Restarting existing PM2 processes..."
    pm2 restart all
else
    echo "🚀 Starting new PM2 processes..."
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup | grep -E '^sudo' | sh

# Display deployment status
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   API: http://localhost:3005"
echo "   Web: http://localhost (via nginx)"
echo "   Backoffice: http://localhost:3006"
echo ""
echo "🖼️  Upload Dashboard:"
echo "   Backoffice: http://localhost:3006 -> Upload Assets menu"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Log files:"
echo "   API: /var/log/streamkita-api-*.log"
echo "   Web: /var/log/streamkita-web-*.log"
echo "   Backoffice: /var/log/streamkita-backoffice-*.log"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 status              - Check application status"
echo "   pm2 logs alkamus-api    - View API logs"
echo "   pm2 logs alkamus-web    - View web logs"
echo "   pm2 logs alkamus-backoffice - View backoffice logs"
echo "   pm2 restart all         - Restart all applications"
echo "   sudo systemctl status nginx - Check nginx status"
echo ""
echo "🎉 VOD Platform is now live!"