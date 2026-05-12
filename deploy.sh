#!/usr/bin/env bash
set -euo pipefail

REMOTE_HOST="contabo4"
REMOTE_SITE="/opt/iwebalmanac-site"
REMOTE_WWW="/var/www/iwebalmanac.net/"

echo "==> Building on ${REMOTE_HOST}..."
ssh "$REMOTE_HOST" "cd ${REMOTE_SITE} && npm run build && rsync -av --delete dist/ ${REMOTE_WWW}"
echo "==> Deploy complete."
