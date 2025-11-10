# Alkamus VOD - Video on Demand Platform

Platform streaming terbaik untuk hiburan berkualitas dari dalam dan luar negeri.

## 🏗️ Project Structure

```
vod/
├── apps/
│   ├── api/              # Fastify backend API
│   └── web/              # React frontend application
├── docker-compose.yml    # PostgreSQL database
├── ecosystem.config.js   # PM2 configuration
└── setup.sh             # Automated setup script
```

## 🚀 Quick Start

### For Production (Server)

```bash
# Clone and setup
git clone <repository-url>
cd vod
chmod +x setup.sh

# Run production setup
NODE_ENV=production ./setup.sh
```

### For Development (Local)

```bash
# Clone and setup
git clone <repository-url>
cd vod
chmod +x setup.sh

# Run development setup
./setup.sh

# Start development servers
# Terminal 1 - API:
cd apps/api && pnpm dev

# Terminal 2 - Web:
cd apps/web && pnpm dev
```

## 📋 Manual Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL (or use Docker)

### Database Setup

```bash
# Using Docker (recommended)
docker-compose up -d

# Or configure your own PostgreSQL database
# Update DATABASE_URL in apps/api/.env
```

### API Setup

```bash
cd apps/api
pnpm install
cp .env.example .env  # Configure your environment
pnpm prisma generate
pnpm build
pnpm start
```

### Web Setup

```bash
cd apps/web
pnpm install
cp .env.example .env  # Configure your environment
pnpm build
pnpm start
```

## 🔧 Configuration

### Environment Variables

**API (apps/api/.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-jwt-secret"
PORT=3005
```

**Web (apps/web/.env):**
```env
PORT=3000
NODE_ENV=production
API_BASE_URL=http://localhost:3005
VITE_API_BASE_URL=http://localhost:3005
```

## 🌐 Access Points

- **API**: http://localhost:3005
- **Web**: http://localhost:3000
- **API Health**: http://localhost:3005/health
- **Web Health**: http://localhost:3000/health

## 📦 Deployment

### Using PM2 (Recommended for Production)

```bash
# Start all applications
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### PM2 Commands

```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart all apps
pm2 reload all      # Reload without downtime
pm2 monit           # Monitor performance
```

## 🛠️ Development

### API Development

```bash
cd apps/api
pnpm dev            # Start with hot reload
pnpm test           # Run tests
pnpm prisma studio  # Open database GUI
```

### Web Development

```bash
cd apps/web
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm preview        # Preview production build
```

## 📁 Important Files

- `setup.sh` - Automated setup script for any environment
- `ecosystem.config.js` - PM2 process management
- `docker-compose.yml` - PostgreSQL database setup
- `.gitignore` - Configured to ignore environment-specific files

## 🔄 Git Workflow

This project is designed to work seamlessly across different environments:

1. **Local Development**: Windows/Mac/Linux development machines
2. **Server Production**: Linux production servers

The setup automatically handles:
- Environment-specific configurations
- Dependency installation
- Database setup
- Process management

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3000 and 3005 are available
2. **Database connection**: Verify DATABASE_URL in apps/api/.env
3. **Dependencies**: Run `pnpm install` in both app directories
4. **Build errors**: Clear cache with `rm -rf node_modules dist`

### Logs

```bash
# PM2 logs
pm2 logs alkamus-api
pm2 logs alkamus-web

# Application logs
tail -f /var/log/streamkita-api-out.log
tail -f /var/log/streamkita-web-out.log
```

## 📞 Support

For issues and questions, please check:
1. Application logs for error messages
2. PM2 status and logs
3. Network connectivity and port availability

---

**Note**: This project is configured to work out-of-the-box for both local development and production deployment without requiring code changes between environments.