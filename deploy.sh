#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="contabo4"
REMOTE_SITE="/opt/iwebalmanac-site"
REMOTE_WWW="/var/www/iwebalmanac.net/"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Syncing source to ${REMOTE_HOST}..."
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.claude' \
  "${LOCAL_DIR}/" "${REMOTE_HOST}:${REMOTE_SITE}/"

echo "==> Building and deploying on ${REMOTE_HOST}..."
ssh "$REMOTE_HOST" "cd ${REMOTE_SITE} && npm run build && node scripts/build-gemini.js && rsync -av --delete dist/ ${REMOTE_WWW}"
echo "==> Deploy complete."
