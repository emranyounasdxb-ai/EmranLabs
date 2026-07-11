#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/home/emranlabs/repositories/EmranLabs"
BUILD_DIR=".next-deploy"
BACKUP_DIR=".next-previous"
LOCK_DIR="$HOME/.emranlabs-deploy.lock"

export PATH="/opt/cpanel/ea-nodejs22/bin:$HOME/.local/bin:$PATH"

restore_previous_build() {
  if [[ ! -d "$APP_DIR/.next" && -d "$APP_DIR/$BACKUP_DIR" ]]; then
    mv "$APP_DIR/$BACKUP_DIR" "$APP_DIR/.next"
  fi
}

run_deployment() {
  cd "$APP_DIR"

  echo "Installing production dependencies..."
  CI=1 NODE_OPTIONS="--max-old-space-size=384" \
    pnpm install --frozen-lockfile \
      --child-concurrency=1 \
      --network-concurrency=1 \
      --reporter=append-only

  rm -rf "$BUILD_DIR" "$BACKUP_DIR"

  echo "Building production release with webpack..."
  NEXT_DIST_DIR="$BUILD_DIR" \
  NEXT_TELEMETRY_DISABLED=1 \
  NODE_OPTIONS="--max-old-space-size=512" \
    pnpm exec next build --webpack

  test -f "$BUILD_DIR/BUILD_ID"

  trap restore_previous_build ERR

  if [[ -d .next ]]; then
    mv .next "$BACKUP_DIR"
  fi

  mv "$BUILD_DIR" .next
  mkdir -p tmp
  touch tmp/restart.txt
  rm -rf "$BACKUP_DIR"

  trap - ERR

  echo "Deployment completed successfully."
  echo "Commit: $(git rev-parse --short HEAD)"
}

if [[ "${1:-}" == "--after-pull" ]]; then
  run_deployment
  exit 0
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another EmranLabs deployment is already running."
  exit 1
fi

cleanup_lock() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

trap cleanup_lock EXIT

cd "$APP_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Deployment stopped because the repository has local changes:"
  git status --short
  exit 1
fi

echo "Fetching the latest main branch..."
git fetch origin main
git checkout main
git pull --ff-only origin main

bash "$APP_DIR/scripts/deploy-cpanel.sh" --after-pull
