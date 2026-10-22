#!/usr/bin/env bash

set -Eeuo pipefail

# ================================================================
# VOD Platform - Production Deployment Script
# ================================================================
# Standar yang sama dengan SD (sd/backend/setup-production.sh) supaya
# pipeline CI/CD bisa memanggil satu perintah yang konsisten:
#
#   ./setup-production.sh [all|api|web|backoffice|broadcaster] [--pull]
#
# Safe default:
#   Build dan recreate container aplikasi (api, web, backoffice,
#   broadcaster) saja. PostgreSQL, MinIO, HLS, dan infrastruktur
#   lain tidak di-restart.
#
# Options:
#   --pull    Run git pull --ff-only sebelum build (harus clean tree).
#
# Contoh:
#   ./setup-production.sh --pull
#   ./setup-production.sh api --pull
#   ./setup-production.sh web
# ================================================================

cd "$(dirname "$0")"

# docker-compose-server.yml adalah file deploy production yang benar.
# (docker-compose-local.yml hanya untuk dev lokal; file lama
#  docker-compose.yml + docker-compose.prod.yml sudah tidak ada.)
COMPOSE_FILE="docker-compose-server.yml"

if docker compose version >/dev/null 2>&1; then
  DC=(docker compose -f "$COMPOSE_FILE")
elif command -v docker-compose >/dev/null 2>&1; then
  DC=(docker-compose -f "$COMPOSE_FILE")
else
  echo "ERROR: docker compose is not installed."
  exit 1
fi

usage() {
  cat <<'EOF'
Usage:
  ./setup-production.sh [all|api|web|backoffice|broadcaster] [--pull]

Safe default:
  Build and recreate api, web, backoffice, broadcaster only.
  PostgreSQL, MinIO, HLS, and infrastructure are not restarted.

Options:
  --pull    Run git pull --ff-only before building (requires clean tree).

Examples:
  ./setup-production.sh --pull
  ./setup-production.sh api --pull
  ./setup-production.sh web
EOF
}

TARGET="all"
DO_PULL=0
for arg in "$@"; do
  case "$arg" in
    all|api|web|backoffice|broadcaster) TARGET="$arg" ;;
    --pull) DO_PULL=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "ERROR: Unknown argument: $arg"; usage; exit 1 ;;
  esac
done

if [ ! -f .env ]; then
  echo "ERROR: .env not found."
  echo "Create and review it first; never commit it:"
  echo "  cp .env.docker.example .env"
  echo "  nano .env"
  exit 1
fi

env_value() {
  local value
  value="$(grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2- || true)"
  printf '%s' "$value"
}

# Required vars: kombinasi dari yang dipakai compose dengan :? guard plus
# secret penting. Placeholder DEFAULT/yang belum diubah akan ditolak.
required_vars=(
  POSTGRES_PASSWORD JWT_SECRET AUTH_HASH_SECRET OTP_HASH_SECRET
  CORS_ALLOWED_ORIGINS MINIO_ROOT_PASSWORD
)
for variable in "${required_vars[@]}"; do
  value="$(env_value "$variable")"
  if [ -z "$value" ] || [[ "$value" == change-me ]] \
     || [[ "$value" == replace-* ]] || [[ "$value" == generate-* ]] \
     || [[ "$value" == CHANGE_* ]]; then
    echo "ERROR: $variable is empty or still a placeholder."
    exit 1
  fi
done

if [ "$DO_PULL" -eq 1 ]; then
  if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Working tree is not clean. Commit or stash changes before --pull."
    exit 1
  fi
  echo "Pulling the current branch with fast-forward only..."
  git pull --ff-only
fi

# Pastikan infrastruktur (postgres, minio) jalan sebelum deploy app.
for dependency in postgres minio; do
  if ! docker inspect -f '{{.State.Running}}' "vod-$dependency" 2>/dev/null | grep -q true; then
    echo "ERROR: vod-$dependency is not running."
    echo "Start infrastructure first: ${DC[*]} up -d postgres minio"
    exit 1
  fi
done

# Container app yang bisa di-recreate. Infra (postgres, minio, hls-*)
# sengaja tidak dimasukkan agar data tidak terganggu saat update kode.
case "$TARGET" in
  api)         SERVICES=(api) ;;
  web)         SERVICES=(web) ;;
  backoffice)  SERVICES=(backoffice) ;;
  broadcaster) SERVICES=(broadcaster) ;;
  all)         SERVICES=(api web backoffice broadcaster) ;;
esac

echo "Building: ${SERVICES[*]}"
"${DC[@]}" build "${SERVICES[@]}"

echo "Recreating application containers only..."
"${DC[@]}" up -d --no-deps --force-recreate "${SERVICES[@]}"

# ---- Health check per container ----------------------------------------
# VOD compose tidak punya healthcheck untuk app container, jadi kita cek
# via port yang dipublish. Mapping port ada di compose file.
declare -A HEALTH_URL=(
  [api]="http://localhost:${API_PORT:-3001}/health"
  [web]="http://localhost:${WEB_PORT:-3000}/health"
  [backoffice]="http://localhost:${BACKOFFICE_PORT:-3006}/health"
  [broadcaster]="http://localhost:${BROADCASTER_PORT:-3010}/health"
)

wait_for_container() {
  local service="$1" container="vod-$1"
  local url="${HEALTH_URL[$1]:-}"
  local attempt status code
  for attempt in $(seq 1 60); do
    status="$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || true)"
    if [ "$status" = "exited" ]; then
      echo "ERROR: $service container exited."
      break
    fi
    if [ -n "$url" ]; then
      code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo 000)"
      if [ "$code" -ge 200 ] && [ "$code" -lt 500 ]; then
        echo "OK: $service (HTTP $code)"
        return 0
      fi
    fi
    sleep 2
  done
  echo "ERROR: $service failed its readiness check."
  "${DC[@]}" logs --tail=150 "$service"
  return 1
}

for service in "${SERVICES[@]}"; do
  wait_for_container "$service"
done

echo ""
"${DC[@]}" ps "${SERVICES[@]}"
echo ""
echo "Production application update completed."
echo "No database, MinIO, or infrastructure service was restarted during a normal update."
