#!/usr/bin/env bash
# ================================================================
# deploy.sh — reusable deployment helper (VOD copy)
# ================================================================
# Di-source oleh workflow CI/CD. Bukan dijalankan langsung.
#
# Fungsi:
#   log_info/ok/warn/error      pretty logging
#   backup_database             pg_dump via container sebelum apapun
#   tag_backup_image            tandai image lama sebagai :backup
#   run_vod_migrations          Prisma migrate deploy
#   deploy_with_rollback        build→recreate→healthcheck→rollback
#
# Env (dari workflow):
#   APP           — wajib "vod"
#   COMPOSE_FILE  — path compose file (wajib)
#   BACKUP_DIR    — default ./backups
# ================================================================

set -Eeuo pipefail

if [ -t 1 ]; then
  C_GREEN=$'\033[0;32m'; C_YELLOW=$'\033[1;33m'
  C_RED=$'\033[0;31m';    C_BLUE=$'\033[0;34m'; C_NC=$'\033[0m'
else
  C_GREEN=""; C_YELLOW=""; C_RED=""; C_BLUE=""; C_NC=""
fi

log_info()  { printf '%s[INFO]%s  %s\n'  "$C_BLUE"   "$C_NC" "$*"; }
log_ok()    { printf '%s[OK]%s    %s\n'  "$C_GREEN"  "$C_NC" "$*"; }
log_warn()  { printf '%s[WARN]%s  %s\n'  "$C_YELLOW" "$C_NC" "$*"; }
log_error() { printf '%s[ERROR]%s %s\n' "$C_RED"     "$C_NC" "$*" >&2; }

_dc() {
  if docker compose version >/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose -f "$COMPOSE_FILE" "$@"
  else
    log_error "docker compose is not installed."
    return 1
  fi
}

# backup_database <container> <user> <db> <label>
backup_database() {
  local container="${1:-}" user="${2:-}" db="${3:-}" label="${4:-app}"
  BACKUP_DIR="${BACKUP_DIR:-./backups}"
  mkdir -p "$BACKUP_DIR"

  if [ -z "$container" ] || [ -z "$user" ] || [ -z "$db" ]; then
    log_error "backup_database: argumen kosong"
    return 1
  fi
  if ! docker inspect "$container" >/dev/null 2>&1; then
    log_warn "container $container tidak ada — skip backup."
    return 0
  fi

  local stamp file
  stamp="$(date +%Y%m%d_%H%M%S)"
  file="$BACKUP_DIR/pre-deploy-${label}-${stamp}.sql"
  log_info "Backup database ($db dari $container)..."
  if docker exec "$container" pg_dump -U "$user" "$db" > "$file"; then
    local size; size="$(du -h "$file" | cut -f1)"
    log_ok "Backup tersimpan: $file ($size)"
  else
    log_error "Backup GAGAL — deploy dihentikan demi keamanan data."
    rm -f "$file"
    return 1
  fi
}

# tag_backup_image <container ...>
tag_backup_image() {
  local c current img
  for c in "$@"; do
    current="$(docker inspect -f '{{.Image}}' "$c" 2>/dev/null || true)"
    [ -z "$current" ] && { log_warn "$c belum ada — skip tag."; continue; }
    img="$(docker inspect -f '{{index .Config.Image}}' "$c" 2>/dev/null || true)"
    if [ -n "$img" ]; then
      docker tag "$current" "$img:backup" 2>/dev/null && \
        log_ok "Image lama $c → :backup" || true
    fi
  done
}

# run_vod_migrations <container=vod-api>
run_vod_migrations() {
  local container="${1:-vod-api}"
  if ! docker inspect "$container" >/dev/null 2>&1; then
    log_warn "$container tidak ada — skip migrasi."
    return 0
  fi
  log_info "Prisma migrate deploy ($container)..."
  if docker exec "$container" npx --no-install prisma migrate deploy 2>&1 | sed 's/^/    /'; then
    log_ok "Migrasi VOD selesai."
  else
    log_error "Migrasi VOD GAGAL."
    return 1
  fi
}

# deploy_with_rollback <service ...>
deploy_with_rollback() {
  local services=($@)
  [ ${#services[@]} -gt 0 ] || { log_error "tidak ada service."; return 1; }

  [ "${APP:-}" = "vod" ] || { log_error "APP harus 'vod'."; return 1; }
  local prefix="vod"

  local containers=() s
  for s in "${services[@]}"; do containers+=("${prefix}-${s}"); done
  tag_backup_image "${containers[@]}"

  log_info "Build: ${services[*]}"
  _dc build "${services[@]}"

  log_info "Recreate container (app only)..."
  _dc up -d --no-deps --force-recreate "${services[@]}"

  local failed=0 container status hc ok
  for s in "${services[@]}"; do
    container="${prefix}-${s}"; ok=0
    for _ in $(seq 1 60); do
      status="$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || true)"
      [ "$status" = "exited" ] && { log_error "$container EXITED."; break; }
      hc="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$container" 2>/dev/null || true)"
      [ "$hc" = "healthy" ] && { ok=1; break; }
      sleep 2
    done
    if [ "$ok" -ne 1 ]; then
      log_error "Health check GAGAL: $container."
      _dc logs --tail=80 "$s"
      failed=1
    else
      log_ok "$container sehat."
    fi
  done

  if [ "$failed" -ne 0 ]; then
    log_warn "ROLLBACK ke image :backup..."
    local img
    for s in "${services[@]}"; do
      container="${prefix}-${s}"
      img="$(docker inspect -f '{{index .Config.Image}}' "$container" 2>/dev/null || true)"
      if [ -n "$img" ] && docker image inspect "$img:backup" >/dev/null 2>&1; then
        log_info "Rollback $container → $img:backup"
        docker stop "$container" >/dev/null 2>&1 || true
        docker rm "$container" >/dev/null 2>&1 || true
        _dc up -d --no-deps --force-recreate "$s" >/dev/null 2>&1 || true
        log_ok "Rollback $container selesai."
      fi
    done
    log_error "Deploy DIBATALKAN. Server kembali ke versi sebelumnya."
    return 1
  fi
  log_ok "Semua service sehat. Deploy sukses."
}
