#!/usr/bin/env bash
# Smoke test do ambiente: sobe a pilha (opcional), espera os healthchecks e confere GET /status.
# Uso: scripts/smoke.sh [url]   ·   SMOKE_UP=0 só checa   ·   COMPOSE="docker compose -f ... -f ..." para prod
set -euo pipefail
URL="${1:-http://127.0.0.1:3333}"
COMPOSE="${COMPOSE:-docker compose}"

if [ "${SMOKE_UP:-1}" = "1" ]; then
  $COMPOSE up -d --build --wait --wait-timeout 240
fi

AUTH=()
[ -n "${TOKEN:-}" ] && AUTH=(-H "Authorization: Bearer ${TOKEN}")

for _ in $(seq 1 30); do
  if [ "$(curl -fsS "${AUTH[@]}" "$URL/status" 2>/dev/null)" = "OK" ]; then
    echo "smoke: OK ($URL/status)"
    exit 0
  fi
  sleep 2
done

echo "smoke: FALHOU em $URL/status" >&2
$COMPOSE ps >&2 || true
$COMPOSE logs --tail 40 api >&2 || true
exit 1
