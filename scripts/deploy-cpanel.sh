#!/usr/bin/env bash
# Build an isolated release; switch Passenger only after a successful smoke test.
set -Eeuo pipefail
umask 077
export PATH="/bin:/usr/bin:/usr/local/bin:$PATH"
SOURCE="/home/emranlabs/repositories/EmranLabs"
ROOT="/home/emranlabs/apps/emranlabs"
ENV_FILE="/home/emranlabs/.config/emranlabs/production.env"
mkdir -p "$ROOT/releases"
# Apache must be able to traverse the app path; private credentials stay 0600.
chmod 755 /home/emranlabs/apps "$ROOT" "$ROOT/releases"
exec 9>"$ROOT/deploy.lock"
flock -n 9 || exit 0
cd "$SOURCE"
git fetch --quiet origin main
SHA=$(git rev-parse origin/main)
if [[ "${1:-}" == "--commit" ]]; then
  [[ "${2:-}" == "$SHA" ]] || { echo 'Main changed; waiting for its checks.'; exit 0; }
fi
[[ "$(cat "$ROOT/deployed-commit" 2>/dev/null || true)" != "$SHA" ]] || exit 0
node "$SOURCE/scripts/check-deploy-ci.mjs" "$SHA"
# Run the tested controller from this commit, including future deployment fixes.
if [[ "$(git rev-parse HEAD)" != "$SHA" ]]; then
  git merge --ff-only "$SHA"
  flock -u 9
  exec /bin/bash "$SOURCE/scripts/deploy-cpanel.sh" --commit "$SHA"
fi
test -f "$ENV_FILE"
test "$(node --version)" = "v24.22.1"
RELEASE="$ROOT/releases/${SHA:0:12}-$(date -u +%Y%m%d%H%M%S)"
mkdir "$RELEASE"
git archive "$SHA" | tar -x -C "$RELEASE"
chmod 755 "$RELEASE"
find "$RELEASE/public" -type d -exec chmod 755 {} +
find "$RELEASE/public" -type f -exec chmod 644 {} +
cp "$ENV_FILE" "$RELEASE/.env.local"
chmod 600 "$RELEASE/.env.local"
cd "$RELEASE"
export NEXT_TELEMETRY_DISABLED=1
CI=1 corepack pnpm install --frozen-lockfile --reporter=append-only
corepack pnpm build:hosting
test -f .next/BUILD_ID
corepack pnpm check:email
PORT=3087 NODE_ENV=production node app.js >"$ROOT/smoke.log" 2>&1 &
SMOKE_PID=$!
trap 'kill "$SMOKE_PID" 2>/dev/null || true' EXIT
READY=0
for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:3087/ > /dev/null; then READY=1; break; fi
  sleep 1
done
[[ "$READY" == 1 ]]
for route in /contact /services /projects/edrive /robots.txt /sitemap.xml; do
  curl --fail --silent "http://127.0.0.1:3087$route" > /dev/null
done
kill "$SMOKE_PID"
wait "$SMOKE_PID" 2>/dev/null || true
trap - EXIT
PREVIOUS=$(readlink -f "$ROOT/current" 2>/dev/null || true)
if [[ -n "$PREVIOUS" && "$PREVIOUS" != "$ROOT/current" ]]; then
  ln -s "$PREVIOUS" "$ROOT/previous.new"
  mv -Tf "$ROOT/previous.new" "$ROOT/previous"
fi
ln -s "$RELEASE" "$ROOT/current.new"
mv -Tf "$ROOT/current.new" "$ROOT/current"
mkdir -p "$RELEASE/tmp"
touch "$RELEASE/tmp/restart.txt"
printf '%s\n' "$SHA" > "$ROOT/deployed-commit"
# Update only the controller checkout; running releases remain immutable.
git -C "$SOURCE" merge --ff-only origin/main
echo "Activated release $SHA; previous release retained."
