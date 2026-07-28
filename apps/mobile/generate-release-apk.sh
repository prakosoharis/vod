#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="${SCRIPT_DIR}/android"
ENV_FILE="${ENVFILE:-${SCRIPT_DIR}/.env.android.release}"
KEYSTORE_FILE="${SMASH_RELEASE_STORE_FILE:-${ANDROID_DIR}/app/smash-release.keystore}"
KEY_ALIAS="${SMASH_RELEASE_KEY_ALIAS:-smashrelease}"
APK_FILE="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"

STORE_PASSWORD_SERVICE="SMASH Android Release Store Password"
KEY_PASSWORD_SERVICE="SMASH Android Release Key Password"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

command -v security >/dev/null 2>&1 ||
  die "Perintah 'security' tidak ditemukan. Script ini ditujukan untuk macOS."

command -v java >/dev/null 2>&1 ||
  die "Java tidak ditemukan. Install/configure JDK terlebih dahulu."

[[ -d "${ANDROID_DIR}" ]] ||
  die "Directory Android tidak ditemukan: ${ANDROID_DIR}"

[[ -x "${ANDROID_DIR}/gradlew" ]] ||
  die "Gradle wrapper tidak ditemukan atau belum executable: ${ANDROID_DIR}/gradlew"

[[ -f "${ENV_FILE}" ]] ||
  die "File environment release tidak ditemukan: ${ENV_FILE}"

[[ -f "${KEYSTORE_FILE}" ]] ||
  die "Keystore release tidak ditemukan: ${KEYSTORE_FILE}"

if [[ -z "${SMASH_RELEASE_STORE_PASSWORD:-}" ]]; then
  SMASH_RELEASE_STORE_PASSWORD="$(
    security find-generic-password \
      -a "${USER}" \
      -s "${STORE_PASSWORD_SERVICE}" \
      -w 2>/dev/null
  )" || die "Store password tidak ditemukan di macOS Keychain."
fi

if [[ -z "${SMASH_RELEASE_KEY_PASSWORD:-}" ]]; then
  SMASH_RELEASE_KEY_PASSWORD="$(
    security find-generic-password \
      -a "${USER}" \
      -s "${KEY_PASSWORD_SERVICE}" \
      -w 2>/dev/null
  )" || die "Key password tidak ditemukan di macOS Keychain."
fi

export SMASH_RELEASE_STORE_FILE="${KEYSTORE_FILE}"
export SMASH_RELEASE_STORE_PASSWORD
export SMASH_RELEASE_KEY_ALIAS="${KEY_ALIAS}"
export SMASH_RELEASE_KEY_PASSWORD

echo "=========================================="
echo "SMASH Android Release APK"
echo "=========================================="
echo "Environment : ${ENV_FILE}"
echo "Keystore    : ${KEYSTORE_FILE}"
echo "Key alias   : ${KEY_ALIAS}"
echo "Password    : loaded securely from environment/Keychain"
echo

if command -v keytool >/dev/null 2>&1; then
  keytool -list \
    -keystore "${KEYSTORE_FILE}" \
    -storepass "${SMASH_RELEASE_STORE_PASSWORD}" \
    -alias "${KEY_ALIAS}" \
    -keypass "${SMASH_RELEASE_KEY_PASSWORD}" \
    >/dev/null 2>&1 ||
    die "Keystore, alias, atau password release tidak valid."

  echo "Keystore validation: PASS"
fi

cd "${ANDROID_DIR}"
ENVFILE="${ENV_FILE}" ./gradlew clean assembleRelease

[[ -f "${APK_FILE}" ]] ||
  die "Gradle selesai, tetapi APK tidak ditemukan: ${APK_FILE}"

echo
echo "BUILD SUCCESS"
echo "APK: ${APK_FILE}"
ls -lh "${APK_FILE}"
