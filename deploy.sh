#!/usr/bin/env bash
# OgeneO one-shot deploy. Run from the project folder:  ./deploy.sh
# Prereqs: Node 20+, a Cloudflare account, a Cloudinary account.
set -euo pipefail

echo "== OgeneO deploy =="

command -v node >/dev/null || { echo "Node.js is required. Install from nodejs.org"; exit 1; }

[ -d node_modules ] || { echo "-- Installing dependencies"; npm install; }

# 1. Cloudflare auth (opens browser the first time)
npx wrangler whoami >/dev/null 2>&1 || npx wrangler login

# 2. D1 database
if grep -q REPLACE_AFTER_D1_CREATE wrangler.jsonc; then
  echo "-- Creating D1 database 'ogeneo'"
  OUT=$(npx wrangler d1 create ogeneo 2>&1) || { echo "$OUT"; exit 1; }
  DB_ID=$(echo "$OUT" | grep -oE '"database_id": "[a-f0-9-]+"' | grep -oE '[a-f0-9-]{36}')
  [ -n "$DB_ID" ] || { echo "Could not parse database_id from:"; echo "$OUT"; exit 1; }
  sed -i.bak "s/REPLACE_AFTER_D1_CREATE/$DB_ID/" wrangler.jsonc && rm -f wrangler.jsonc.bak
  echo "   database_id set: $DB_ID"
fi

echo "-- Applying schema (remote)"
npx wrangler d1 execute ogeneo --remote --file=./db/schema.sql

read -r -p "Seed demo content? (y/N) " SEED
[ "${SEED:-n}" = "y" ] && npx wrangler d1 execute ogeneo --remote --file=./db/seed.sql

# 3. Cloudinary config
if grep -q '"CLOUDINARY_CLOUD_NAME": "REPLACE_ME"' wrangler.jsonc; then
  read -r -p "Cloudinary cloud name: " CLOUD
  sed -i.bak "s/\"CLOUDINARY_CLOUD_NAME\": \"REPLACE_ME\"/\"CLOUDINARY_CLOUD_NAME\": \"$CLOUD\"/" wrangler.jsonc && rm -f wrangler.jsonc.bak
fi

echo "-- Secrets (get key/secret from Cloudinary dashboard > Settings > API Keys)"
npx wrangler secret put CLOUDINARY_API_KEY
npx wrangler secret put CLOUDINARY_API_SECRET
echo "-- UPLOAD_SECRET is what your iPhone Shortcut sends. Suggestion:"
echo "   $(openssl rand -hex 24 2>/dev/null || echo 'pick-a-long-random-string')"
npx wrangler secret put UPLOAD_SECRET

# 4. Build + deploy
echo "-- Building and deploying"
npm run deploy

echo "== Done. Your site is live at the workers.dev URL above. =="
echo "Next: set up the iPhone Shortcut (see docs/shortcut.md)."
