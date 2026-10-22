#!/usr/bin/env bash
# ================================================================
# install-runner.sh — pasang GitHub Actions self-hosted runner di server
# ================================================================
# Self-hosted runner = tanpa limit menit, job jalan lokal di server
# (tidak perlu SSH/secret key), ringan (~50MB), jalan sebagai systemd service.
#
# DESAIN 1-RUNNER-PER-SERVER berbasis label:
#   Server staging → label [self-hosted, staging]
#   Server prod    → label [self-hosted, prod]
#   Workflow menarget runner via label → tiap server deploy dirinya sendiri.
#
# PRASYARAT: token registrasi runner dari GitHub
#   (repo → Settings → Actions → Runners → New self-hosted runner).
#   Token berlaku ~1 jam.
#
# PENGGUNAAN (jalankan di server tujuan):
#   sudo ./scripts/install-runner.sh \
#       --repo prakosoharis/vod \
#       --token AAAAAA... \
#       --env staging          # staging | prod
#
# Catatan: script ini identik untuk VOD & SD. Cukup bedakan --repo.
# ================================================================

set -Eeuo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: jalankan dengan sudo (butuh akses systemd & membuat user)."
  exit 1
fi

REPO="" TOKEN="" ENV_LABEL="" RUNNER_USER="github-runner" RUNNER_DIR="/actions-runner"
DO_UNINSTALL=0
while [ $# -gt 0 ]; do
  case "$1" in
    --repo) REPO="$2"; shift 2 ;;
    --token) TOKEN="$2"; shift 2 ;;
    --env) ENV_LABEL="$2"; shift 2 ;;
    --user) RUNNER_USER="$2"; shift 2 ;;
    --dir) RUNNER_DIR="$2"; shift 2 ;;
    --uninstall) DO_UNINSTALL=1; shift ;;
    -h|--help) sed -n '2,/^# ====/p' "$0" | sed 's/^# //; s/^#//'; exit 0 ;;
    *) echo "ERROR: argumen tidak dikenal: $1"; exit 1 ;;
  esac
done

if [ "$DO_UNINSTALL" -eq 1 ]; then
  echo ">> Menghentikan & mencopot runner..."
  SVC="${RUNNER_DIR##*/}.$(hostname).service"
  [ -f "/etc/systemd/system/${SVC}" ] && systemctl stop "$SVC" 2>/dev/null || true
  [ -f "/etc/systemd/system/${SVC}" ] && systemctl disable "$SVC" 2>/dev/null || true
  if [ -x "${RUNNER_DIR}/config.sh" ]; then
    sudo -u "$RUNNER_USER" "${RUNNER_DIR}/config.sh" remove --token "${TOKEN:-UNREGISTER}" 2>/dev/null || true
  fi
  rm -f "/etc/systemd/system/${SVC}"
  systemctl daemon-reload
  rm -rf "$RUNNER_DIR"
  id -u "$RUNNER_USER" >/dev/null 2>&1 && userdel -r "$RUNNER_USER" 2>/dev/null || true
  echo ">> Runner dicopot."
  exit 0
fi

if [ -z "$REPO" ] || [ -z "$TOKEN" ] || [ -z "$ENV_LABEL" ]; then
  echo "ERROR: --repo, --token, --env wajib diisi. Lihat --help."
  exit 1
fi
case "$ENV_LABEL" in
  staging|prod) : ;;
  *) echo "ERROR: --env harus 'staging' atau 'prod'."; exit 1 ;;
esac

# 1. user dedicated
if ! id -u "$RUNNER_USER" >/dev/null 2>&1; then
  echo ">> Membuat user $RUNNER_USER..."
  useradd -m -s /bin/bash "$RUNNER_USER"
  if getent group docker >/dev/null 2>&1; then
    usermod -aG docker "$RUNNER_USER"   # akses docker tanpa sudo
  fi
fi

# 2. download runner binary
mkdir -p "$RUNNER_DIR"; chown "$RUNNER_USER":"$RUNNER_USER" "$RUNNER_DIR"
if [ ! -f "$RUNNER_DIR/config.sh" ]; then
  echo ">> Mendownload runner binary..."
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)       ARCH="x64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *) echo "ERROR: arsitektur $ARCH belum didukung."; exit 1 ;;
  esac
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  LATEST=$(curl -fsS https://api.github.com/repos/actions/runner/releases/latest \
           | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/')
  [ -n "$LATEST" ] || { echo "ERROR: tidak bisa ambil versi runner."; exit 1; }
  PKG="actions-runner-${OS}-${ARCH}-${LATEST}.tar.gz"
  URL="https://github.com/actions/runner/releases/download/v${LATEST}/${PKG}"
  cd "$RUNNER_DIR"
  sudo -u "$RUNNER_USER" curl -fsSLO "$URL"
  sudo -u "$RUNNER_USER" tar xzf "$PKG"
  sudo -u "$RUNNER_USER" rm -f "$PKG"
  cd - >/dev/null
  echo ">> Runner v$LATEST terpasang di $RUNNER_DIR"
fi

# 3. registrasi ke repo + label
echo ">> Registrasi runner ke repo $REPO (label: $ENV_LABEL)..."
sudo -u "$RUNNER_USER" "${RUNNER_DIR}/config.sh" \
  --url "https://github.com/${REPO}" \
  --token "$TOKEN" \
  --name "runner-${ENV_LABEL}-$(hostname)" \
  --work "${RUNNER_DIR}/_work" \
  --labels "self-hosted,${ENV_LABEL}" \
  --unattended \
  --replace

# 4. install & start systemd service
echo ">> Install & start systemd service..."
sudo -u "$RUNNER_USER" "${RUNNER_DIR}/svc.sh" install "$RUNNER_USER"
"${RUNNER_DIR}/svc.sh" start

sleep 3
SVC="${RUNNER_DIR##*/}.$(hostname).service"
if systemctl is-active --quiet "$SVC"; then
  echo ""
  echo "================================================================"
  echo "  RUNNER AKTIF: $SVC"
  echo "  Label: [self-hosted, $ENV_LABEL]"
  echo "================================================================"
  echo "Verifikasi di GitHub: Settings → Actions → Runners → status 'Idle'."
  echo ""
  echo "Perintah berguna:"
  echo "  status : sudo systemctl status $SVC"
  echo "  log    : sudo journalctl -u $SVC -f"
else
  echo "ERROR: service runner tidak aktif. Cek:"
  echo "  sudo journalctl -u \"$SVC\" -n 50 --no-pager"
  exit 1
fi
