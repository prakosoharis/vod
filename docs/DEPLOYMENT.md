# Deployment Workflow Harian — VOD Platform

## Model branching

> ⚠️ **Mapping branch (catat baik-baik):**
> - **`main` = staging** → server yang sedang aktif sekarang (push langsung deploy)
> - **`production` = prod** → server prod (nantinya)

```
fitur-X ──PR──→  main  ──→  deploy otomatis ke SERVER SEKARANG (staging)
                    │
                    └─ merge/PR ─→  production  ──→  deploy otomatis ke SERVER PROD
```

- **`main`**: tempat uji & server aktif sekarang. Push kesini = langsung deploy ke server sekarang.
- **`production`**: kode siap produksi. Push/merge kesini = deploy ke server prod (saat sudah ada).

> Aturan emas: **jangan pernah push ke `production` tanpa lewat `main`**.
> Buat branch fitur → PR ke `main` → uji → PR `main` → `production`.

## Workflow sehari-hari

### Skenario A: mau rilis fitur baru

```bash
# 1. buat branch dari main
git checkout main && git pull
git checkout -b fitur-X

# 2. kerja, commit
git add -A && git commit -m "feat: fitur X"

# 3. push fitur, buat PR: fitur-X → main, lalu merge
#    (→ auto deploy ke server sekarang / staging)
git push origin fitur-X

# 4. uji di server sekarang, kalau OK:
#    buat PR: main → production, lalu merge
#    (→ auto deploy ke server prod — saat sudah ada)
```

### Skenario B: hotfix darurat di prod

```bash
# 1. branch dari production
git checkout production && git pull
git checkout -b hotfix-Y

# 2. perbaiki, commit
git commit -am "fix: Y"

# 3. PR hotfix-Y → production, merge (→ auto deploy prod)
# 4. JANGAN LUPA: merge hotfix ke main juga (biar staging ikut terupdate)
git checkout main && git pull
git merge hotfix-Y
git push origin main
```

## Deploy manual (darurat / tanpa pipeline)

Pipeline sedang bermasalah? Deploy manual via script standar:

```bash
ssh ke-server-sekarang        # main = staging = server yang aktif sekarang
cd /path/ke/vod
./setup-production.sh --pull          # pull + build + recreate + health check
# atau per-service:
./setup-production.sh api --pull      # backend saja
./setup-production.sh web --pull      # frontend saja
```

> `setup-production.sh` = versi standar pipeline (validasi env, health check, no restart infra).
> `deploy-docker.sh` lama sekarang hanya wrapper yang redirect ke `setup-production.sh`.

## Rollback manual

Pipeline sudah punya auto-rollback (health check gagal → balik ke image `:backup`).
Tapi kalau perlu rollback manual:

```bash
# lihat image backup yang tersimpan
docker images | grep ':backup'

# rollback per service (contoh: api)
docker compose -f docker-compose-server.yml stop api
docker rm vod-api
# edit compose atau tag ulang: pakai image :backup
docker compose -f docker-compose-server.yml up -d --no-deps --force-recreate api
```

Restore database dari backup (kalau diperlukan):
```bash
# lihat daftar backup
ls -lh backups/

# restore
docker exec -i vod-postgres psql -U streamkita streamkita_dev < backups/pre-deploy-prod-XXXXXX.sql
```

## Membaca hasil pipeline

Di GitHub: tab **Actions**.

| Status | Arti |
|--------|------|
| ✅ hijau | Deploy sukses, semua container sehat |
| ❌ merah (test job) | Lint/test gagal — kode belum deploy sama sekali |
| ❌ merah (deploy job) | Health check gagal — **server sudah di-rollback otomatis**, cek log |
| 🟡 kuning | Sedang jalan |

## Lihat log container setelah deploy

```bash
# semua service
docker compose -f docker-compose-server.yml logs -f

# satu service
docker compose -f docker-compose-server.yml logs -f api
docker compose -f docker-compose-server.yml logs -f web

# status
docker compose -f docker-compose-server.yml ps
```

## Port & domain (prod)

| Service | Port lokal | Domain |
|---------|-----------|--------|
| web | 3000 | `smashstream.id` |
| api | 3001 | `api.smashstream.id` |
| backoffice | 3006 | (internal/admin) |
| broadcaster | 3010 | (internal) |
| postgres | 5432 | (lokal saja) |
| minio | 9000/9001 | (lokal saja) |
