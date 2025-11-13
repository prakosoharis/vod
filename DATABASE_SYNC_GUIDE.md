# Database Sync Guide: Local → Server

Panduan untuk sinkronisasi perubahan database dari development local ke production server secara manual melalui Git repository.

## 🔄 Workflow Overview

1. **Local Development**: Buat perubahan schema/seed data
2. **Generate Migration**: Buat migration file
3. **Commit & Push**: Simpan perubahan ke repository
4. **Server Deployment**: Apply migration di server

## 📝 Step-by-Step Instructions

### 🔧 Di Local Development

#### 1. Setiap ada perubahan di schema.prisma:

```bash
# Buka terminal di local
cd apps/api

# Generate migration baru (akan create file baru di prisma/migrations/)
npx prisma migrate dev --name nama_perubahan

# Contoh:
npx prisma migrate dev --name add_user_phone_field
```

#### 2. Update seed data (jika ada perubahan):

```bash
# Edit file prisma/seed.ts
# Tambah/update seed data sesuai kebutuhan

# Test seed data di local
npm run seed
```

#### 3. Commit dan push ke repository:

```bash
# Git add semua perubahan
git add apps/api/prisma/

# Commit dengan deskripsi jelas
git commit -m "feat: add user phone field + update seed data"

# Push ke repository
git push origin main
```

---

### 🚀 Di Production Server

#### 1. Pull latest changes:

```bash
# SSH ke server
ssh user@your-server

# Navigate ke project directory
cd /var/www/alkamus/vod

# Pull latest changes
git pull origin main
```

#### 2. Backup database (IMPORTANT!):

```bash
# Backup database sebelum migration
docker exec vod-postgres pg_dump -U vod_user vod_db > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Atau backup dengan pg_dump langsung
pg_dump -h localhost -U vod_user vod_db > backup_before_migration.sql
```

#### 3. Apply migration:

```bash
# Navigate ke API directory
cd apps/api

# Generate Prisma client
npx prisma generate

# Apply migration ke production database
npx prisma migrate deploy
```

#### 4. Update seed data (jika ada perubahan):

```bash
# Run seed data update (seed script harus designed untuk idempotent)
npm run seed
```

#### 5. Restart API service:

```bash
# Restart dengan PM2
pm2 restart alkamus-api

# Atau restart semua
pm2 restart all
```

#### 6. Verify deployment:

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs alkamus-api --lines 50

# Test API health
curl http://localhost:3005/health
```

---

## 🛡️ Best Practices

### ✅ Do's:
- **ALWAYS backup** production database sebelum migration
- Test migration di development environment terlebih dahulu
- Gunakan descriptive migration names
- Review generated migration files sebelum commit
- Keep seed data idempotent (bisa dijalankan berulang kali)
- Document breaking changes di migration description

### ❌ Don'ts:
- Jangan edit migration files secara manual (kecuali sangat perlu)
- Jangan migrate production tanpa backup
- Jangan push untested migrations
- Jangan忘记 restart services setelah migration

---

## 🗂️ File Structure untuk Tracking

```
apps/api/prisma/
├── schema.prisma              # Main database schema
├── migrations/               # All migration files
│   ├── 20251103051405_init/  # Initial migration
│   ├── 20251113_add_phone/   # Example: new migration
│   │   └── migration.sql     # SQL commands
│   └── migration_lock.toml   # Prisma migration lock
├── seed.ts                   # Seed data script
└── seed_history.md           # (Optional) Track seed changes
```

---

## 🔍 Troubleshooting

### Migration Failed:
1. Check error logs: `pm2 logs alkamus-api`
2. Check database connection
3. Verify SQL syntax di migration file
4. Check for locks: `SELECT * FROM pg_locks;`

### Seed Data Issues:
1. Backup current data
2. Check seed script for conflicts
3. Run seed dengan `--preview-flag` untuk dry run

### Rollback Migration:
```bash
# DANGEROUS! Use only if absolutely necessary
npx prisma migrate reset --skip-seed
# Restore from backup afterwards
```

---

## 📋 Migration Checklist

### Before Commit (Local):
- [ ] Migration tested di local development
- [ ] Migration file reviewed
- [ ] Seed data tested
- [ ] No hardcoded values in migration
- [ ] Proper indexes added if needed

### Before Deploy (Server):
- [ ] Database backed up
- [ ] Latest code pulled from repo
- [ ] Migration file exists in server
- [ ] API services can be restarted safely
- [ ] Rollback plan ready

### After Deploy:
- [ ] Migration applied successfully
- [ ] API services restarted
- [ ] Application functionality tested
- [ ] Database verified
- [ ] Logs monitored for issues