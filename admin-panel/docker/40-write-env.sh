#!/bin/sh
# Rewrite env.js from container env vars so one static image serves every
# environment. Runs (via the nginx base image's docker-entrypoint.d) before
# nginx starts. API_BASE="" means the browser calls the panel's own origin and
# nginx proxies /api,/media,/static to the backend.
set -eu

: "${API_BASE:=}"
: "${APP_NAME:=Player2 Admin}"

cat > /usr/share/nginx/html/env.js <<EOF
// Generated at container start from environment variables. Do not edit.
window.__ENV__ = {
  API_BASE: "${API_BASE}",
  APP_NAME: "${APP_NAME}"
};
EOF

echo "[40-write-env] wrote env.js (API_BASE='${API_BASE}')"
