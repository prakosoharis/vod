#!/usr/bin/env bash
# ================================================================
# notify.sh — webhook notifikasi deploy (Discord/Telegram/Slack)
# ================================================================
# Di-source. Non-fatal: diam bila NOTIFY_WEBHOOK_URL kosong.
#
# Env:
#   NOTIFY_WEBHOOK_URL   — URL webhook tujuan
#   NOTIFY_PROVIDER      — discord|telegram|slack (auto-detect bila kosong)
#   APP, ENVIRONMENT     — label untuk isi pesan
# ================================================================

set -Eeuo pipefail

_notify_detect_provider() {
  [ -n "${NOTIFY_PROVIDER:-}" ] && { echo "$NOTIFY_PROVIDER"; return; }
  local url="${NOTIFY_WEBHOOK_URL:-}"
  case "$url" in
    *discord.com*)      echo "discord" ;;
    *api.telegram.org*) echo "telegram" ;;
    *hooks.slack.com*)  echo "slack" ;;
    *)                  echo "generic" ;;
  esac
}

_notify_send() {
  local url="${NOTIFY_WEBHOOK_URL:-}"
  [ -z "$url" ] && return 0
  curl -s -o /dev/null -w '' \
    -H 'Content-Type: application/json' \
    -X POST "$url" -d "$1" 2>/dev/null || true
}

notify_success() {
  local title="${1:-Deploy sukses}" detail="${2:-}"
  local app="${APP:-app}" env="${ENVIRONMENT:-?}" provider
  provider="$(_notify_detect_provider)"
  case "$provider" in
    discord)  _notify_send "{\"username\":\"Deploy Bot\",\"embeds\":[{\"title\":\"\xF0\x9F\x9F\xA2 $title\",\"description\":\"**$app** \xC2\xB7 **$env**\n$detail\",\"color\":3066993}]}" ;;
    telegram) _notify_send "{\"text\":\"\xF0\x9F\x9F\xA2 $title\n*${app}* \xC2\xB7 *${env}*\n${detail}\"}" ;;
    slack)    _notify_send "{\"text\":\":white_check_mark: $title\n*${app}* \xC2\xB7 *${env}*\n${detail}\"}" ;;
    *)        _notify_send "{\"text\":\"\xF0\x9F\x9F\xA2 $title | $app | $env | $detail\"}" ;;
  esac
  echo "[notify] success → $provider"
}

notify_failure() {
  local title="${1:-Deploy GAGAL}" detail="${2:-}"
  local app="${APP:-app}" env="${ENVIRONMENT:-?}" provider
  provider="$(_notify_detect_provider)"
  case "$provider" in
    discord)  _notify_send "{\"username\":\"Deploy Bot\",\"embeds\":[{\"title\":\"\xF0\x9F\x94\xB4 $title\",\"description\":\"**$app** \xC2\xB7 **$env**\n$detail\",\"color\":15158332}]}" ;;
    telegram) _notify_send "{\"text\":\"\xF0\x9F\x94\xB4 $title\n*${app}* \xC2\xB7 *${env}*\n${detail}\"}" ;;
    slack)    _notify_send "{\"text\":\":x: $title\n*${app}* \xC2\xB7 *${env}*\n${detail}\"}" ;;
    *)        _notify_send "{\"text\":\"\xF0\x9F\x94\xB4 $title | $app | $env | $detail\"}" ;;
  esac
  echo "[notify] failure → $provider"
}
