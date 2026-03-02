#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Cursor Cloud setup starting in: $ROOT_DIR"

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "Missing required file: $path" >&2
    exit 1
  fi
}

ensure_from_template() {
  local target="$1"
  local template="$2"
  if [[ ! -f "$target" ]]; then
    cp "$template" "$target"
    echo "Created $target from $template"
  else
    echo "Using existing $target"
  fi
}

upsert_key() {
  local file="$1"
  local key="$2"
  local value="$3"
  if rg -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$file"
  fi
}

require_file ".env.example"
require_file "packages/shadow-index/.env.example"
require_file "packages/auth-portal/.env.example"

ensure_from_template ".env" ".env.example"
ensure_from_template "packages/shadow-index/.env" "packages/shadow-index/.env.example"
ensure_from_template "packages/auth-portal/.env" "packages/auth-portal/.env.example"

echo "==> Applying cloud dev defaults"
upsert_key ".env" "NODE_ENV" "development"
upsert_key ".env" "LOG_LEVEL" "debug"
upsert_key ".env" "API_PORT" "3000"
upsert_key ".env" "API_URL" "http://localhost:3000" # pragma: allowlist secret
upsert_key ".env" "JWT_SECRET" "dev-jwt-secret-change-me"
upsert_key ".env" "GOOGLE_OAUTH_MODE" "dev"

upsert_key "packages/shadow-index/.env" "NODE_ENV" "development"
upsert_key "packages/shadow-index/.env" "LOG_LEVEL" "debug"
upsert_key "packages/shadow-index/.env" "JWT_SECRET" "dev-jwt-secret-change-me"
upsert_key "packages/shadow-index/.env" "GOOGLE_OAUTH_MODE" "dev"

upsert_key "packages/auth-portal/.env" "VITE_API_BASE_URL" "http://localhost:3000" # pragma: allowlist secret
upsert_key "packages/auth-portal/.env" "NODE_ENV" "development"

echo "==> Installing dependencies"
pnpm install
npm install --prefix "packages/shadow-index"
npm install --prefix "packages/auth-portal"
npm install --prefix "packages/lens-extension"

echo "==> Running setup verification"
bash "scripts/setup-check.sh"

echo "==> Running package builds"
npm run build --prefix "packages/shadow-index"
npm run build --prefix "packages/auth-portal"
npm run build --prefix "packages/lens-extension"

echo
echo "Setup complete."
echo "Start API:      cd packages/shadow-index && npm run dev"
echo "Start frontend: cd packages/auth-portal && npm run dev"
