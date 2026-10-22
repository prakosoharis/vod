# CI/CD Setup — VOD Platform

Pipeline deployment self-hosted GitHub Actions dengan **1 runner per server berbasis label**.
Tanpa limit menit, tanpa SSH antar server — tiap server men-deploy dirinya sendiri secara lokal.

## Arsitektur

> ⚠️ **Mapping branch (catat baik-baik):**
> - **`main` = staging** → server yang sedang aktif sekarang
> - **`production` = prod** → server prod (nantinya, saat sudah disiapkan)

```
git push ke branch `main`        ──→  Deploy ke SERVER SEKARANG  (runner label: staging)
git push ke branch `production`  ──→  Deploy ke SERVER PROD      (runner label: prod)
```

| Branch | Server tujuan | Runner label | Status |
|--------|---------------|--------------|--------|
| `main` | server sekarang (staging) | `[self-hosted, staging]` | ✅ aktif sekarang |
| `production` | server prod | `[self-hosted, prod]` | ⏳ nunggu server prod |

Job **test** jalan di runner manapun (lintas env aman).
Job **deploy** terkunci ke label environment masing-masing.

## Alur pipeline (saat push)

```
push
 │
 ▼
TEST (lint + unit test)          ← gagal? STOP, tidak deploy
 │ (hijau)
 ▼
BACKUP DATABASE (pg_dump)        ← gagal? STOP (data aman)
 │
 ▼
git pull --ff-only
 │
 ▼
MIGRASI DB (Prisma migrate deploy)
 │
 ▼
BUILD + RECREATE container (app only)
 │
 ▼
HEALTH CHECK per container       ← gagal? AUTO-ROLLBACK ke image :backup
 │
 ▼
NOTIFIKASI (Discord/Telegram/Slack)
```

## Setup — sekali per server

### 1. Install runner di server staging

Ambil token registrasi sementara dari GitHub:
`repo → Settings → Actions → Runners → New self-hosted runner`
(token berlaku ~1 jam).

Di **server staging**, jalankan:

```bash
sudo ./scripts/install-runner.sh \
    --repo prakosoharis/vod \
    --token <TOKEN_DARI_GITHUB> \
    --env staging
```

### 2. Install runner di server prod

Ulangi di **server prod**:

```bash
sudo ./scripts/install-runner.sh \
    --repo prakosoharis/vod \
    --token <TOKEN_DARI_GITHUB> \
    --env prod
```

### 3. Verifikasi runner

Di GitHub: `Settings → Actions → Runners`.
Pastikan kedua runner berstatus **Idle** dengan label `[self-hosted]` + `[staging]`/`[prod]`.

Cek di server:
```bash
sudo systemctl status actions.runner.vod.runner-staging-<hostname>.service
sudo journalctl -u actions.runner.vod.runner-staging-<hostname>.service -f
```

### 4. Konfigurasi secret (opsional, untuk notifikasi)

Di GitHub: `Settings → Secrets and variables → Actions → New repository secret`.

| Secret | Untuk | Contoh |
|--------|-------|--------|
| `NOTIFY_WEBHOOK_URL` | URL webhook Discord/Telegram/Slack | `https://discord.com/api/webhooks/...` |

Jika tidak di-set, notifikasi dilewati diam-diam (non-fatal).

## Yang sudah di-deploy otomatis

Setiap pipeline push menjalankan **secara otomatis**:
1. Lint + test (gagal → deploy diblok)
2. Backup database otomatis (`./backups/pre-deploy-<env>-<timestamp>.sql`)
3. Migrasi database (Prisma `migrate deploy`)
4. Build & recreate container: `api`, `web`, `backoffice`, `broadcaster`
5. Health check per container (gagal → **rollback otomatis** ke image `:backup`)
6. Notifikasi sukses/gagal

**Infrastruktur (Postgres, MinIO, HLS) sengaja TIDAK di-restart** saat update kode.

## Manajemen runner

```bash
# status
sudo systemctl status actions.runner.vod.runner-<env>-<hostname>.service

# stop / start / restart
sudo /actions-runner/svc.sh stop
sudo /actions-runner/svc.sh start

# lihat log realtime
sudo journalctl -u actions.runner.vod.runner-<env>-<hostname>.service -f

# copot runner (pindah server / bersih-bersih)
sudo ./scripts/install-runner.sh --uninstall --token <TOKEN_UNREGISTER>
```

## Troubleshooting

**Runner tidak muncul / status Offline**
- Cek service: `sudo systemctl status actions.runner.*`
- Cek log: `sudo journalctl -u actions.runner.* -n 100`
- Token sudah kedaluwarsa? Buat ulang token & reinstall.

**Deploy gagal di health check**
- Pipeline sudah otomatis rollback ke versi sebelumnya.
- Lihat log container: `docker compose -f docker-compose-server.yml logs --tail=200 api`

**Migrasi gagal**
- Pipeline berhenti (tidak melanjutkan deploy). Backup DB sudah ada di `./backups/`.
- Cek: `docker exec vod-api npx prisma migrate status`

**Restore dari backup**
```bash
docker exec -i vod-postgres psql -U streamkita streamkita_dev < ./backups/pre-deploy-prod-XXXXXX.sql
```
