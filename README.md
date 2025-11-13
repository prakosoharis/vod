# Alkamus VOD - Video on Demand Platform

Platform streaming terbaik untuk hiburan berkualitas dari dalam dan luar negeri.

**🎬 Complete Platform Features:**
- **Video Streaming**: Film dan series dengan kualitas HD
- **Admin Backoffice**: Manajemen konten dan user yang lengkap
- **RESTful API**: Backend yang robust dan scalable
- **Responsive Design**: Optimal di desktop dan mobile

## 🏗️ Project Structure

```
vod/
├── apps/
│   ├── api/              # Fastify backend API
│   ├── web/              # React frontend application
│   └── backoffice/       # React admin dashboard
├── scripts/
│   ├── local-migrate.sh  # Local migration script
│   └── server-migrate.sh # Server migration script
├── docker-compose.yml    # PostgreSQL database
├── ecosystem.config.js   # PM2 configuration
├── setup.sh             # Automated setup script
└── DATABASE_SYNC_GUIDE.md # Database sync guide
```

## 🚀 Quick Start

### For Production (Server)

```bash
# Clone and setup
git clone <repository-url>
cd vod
chmod +x setup.sh

# Run production setup (for server)
./setup.sh production
```

### For Development (Local Laptop)

```bash
# Clone and setup
git clone <repository-url>
cd vod
chmod +x setup.sh

# Run development setup (for local)
./setup.sh development

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
- **Backoffice Admin**: http://localhost:3006
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
pm2 status                    # Check all services status
pm2 logs                      # View all logs
pm2 logs alkamus-api         # View API logs only
pm2 logs alkamus-backoffice  # View backoffice logs only
pm2 restart all              # Restart all apps
pm2 restart alkamus-api      # Restart API only
pm2 restart alkamus-backoffice # Restart backoffice only
pm2 reload all               # Reload without downtime
pm2 monit                    # Monitor performance
```

### Setup Commands

```bash
# Production setup (for server deployment)
./setup.sh production

# Development setup (for local laptop)
./setup.sh development

# Alternative using environment variables
NODE_ENV=production ./setup.sh
NODE_ENV=development ./setup.sh
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

### Backoffice Development

```bash
cd apps/backoffice
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run type-check  # TypeScript type checking
```

## 🔄 Database Sync (Local → Server)

### Workflow untuk sync perubahan database dari local ke server:

#### **Di Local (Laptop):**

```bash
# 1. Buat migration baru
./scripts/local-migrate.sh "add_user_phone_field"

# 2. Test dan review migration
# 3. Commit ke repository
git add apps/api/prisma/
git commit -m "feat: add user phone field"
git push origin main
```

#### **Di Server:**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Run migration dengan backup otomatis
./scripts/server-migrate.sh

# 3. Atau backup saja (jika ingin migration manual)
./scripts/server-migrate.sh --backup-only
```

### Available Scripts:
- **`./scripts/local-migrate.sh "migration_name"`** - Buat migration di local
- **`./scripts/server-migrate.sh`** - Apply migration di server dengan backup
- **`DATABASE_SYNC_GUIDE.md`** - Panduan lengkap dan troubleshooting

### Commands Manual:
```bash
# Local
cd apps/api
npx prisma migrate dev --name migration_name
npm run seed

# Server
cd apps/api
npx prisma migrate deploy
npm run seed
pm2 restart alkamus-api
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