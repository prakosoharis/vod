#!/bin/bash

# ================================================================
# DEPRECATED - jangan dipakai langsung.
# ================================================================
# Script lama ini merujuk docker-compose.yml + docker-compose.prod.yml
# yang sudah TIDAK ADA lagi, sehingga pasti gagal bila dijalankan.
#
# Gunakan sebagai gantinya:
#   ./setup-production.sh --pull
#
# File ini dipertahankan hanya sebagai backward-compatible wrapper
# agar siapapun yang terbiasa memanggil deploy-docker.sh tetap
# teredirect ke script yang benar.
# ================================================================

set -e

echo "[deploy-docker.sh] DEPRECATED: redirecting to setup-production.sh" >&2
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT_DIR/setup-production.sh" "$@"
