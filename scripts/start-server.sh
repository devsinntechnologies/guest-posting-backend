#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${NGINX_PORT:-80}"
REMOTE="${1:-}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop or Colima first."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but not running. Start Docker Desktop or run: colima start"
  exit 1
fi

mkdir -p uploads

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

local_ip() {
  ipconfig getifaddr en0 2>/dev/null \
    || ipconfig getifaddr en1 2>/dev/null \
    || hostname -I 2>/dev/null | awk '{print $1}' \
    || true
}

LAN_IP="$(local_ip)"

# Set PUBLIC_URL so uploaded file links work from other machines on the network
if [[ "$REMOTE" != "--remote" && -n "$LAN_IP" ]]; then
  export PUBLIC_URL="http://${LAN_IP}:${PORT}"
  export NGINX_PORT="${PORT}"
  echo "PUBLIC_URL set to ${PUBLIC_URL} (used for upload URLs)"
fi

if [[ "$REMOTE" == "--remote" ]]; then
  echo "Starting server with public internet tunnel..."
  docker compose --profile remote up --build -d
else
  echo "Building and starting nginx + app + postgres + redis..."
  docker compose up --build -d
fi

echo "Waiting for the API to become healthy..."
for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/docs" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Devsinn API Server (nginx → NestJS)"
echo "════════════════════════════════════════════════════════"
echo ""
echo "On THIS machine:"
echo "  Swagger: http://127.0.0.1:${PORT}/api/docs"
echo "  API:     http://127.0.0.1:${PORT}/api/v1"

if [[ -n "$LAN_IP" ]]; then
  echo ""
  echo "From OTHER machines on the same network (Wi-Fi / LAN):"
  echo "  Swagger: http://${LAN_IP}:${PORT}/api/docs"
  echo "  API:     http://${LAN_IP}:${PORT}/api/v1"
  echo ""
  echo "Frontend .env.local on other machines:"
  echo "  NEXT_PUBLIC_API_BASE_URL=http://${LAN_IP}:${PORT}/api/v1"
fi

if [[ "$REMOTE" == "--remote" ]]; then
  echo ""
  echo "Fetching public URL (works from anywhere on the internet)..."
  for _ in $(seq 1 30); do
    PUBLIC_URL="$(docker compose logs tunnel 2>/dev/null | grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)"
    if [[ -n "$PUBLIC_URL" ]]; then
      echo "  Swagger: ${PUBLIC_URL}/api/docs"
      echo "  API:     ${PUBLIC_URL}/api/v1"
      echo ""
      echo "Frontend .env.local:"
      echo "  NEXT_PUBLIC_API_BASE_URL=${PUBLIC_URL}/api/v1"
      echo ""
      echo "Share this URL with anyone, anywhere."
      exit 0
    fi
    sleep 2
  done
  echo "Tunnel is starting. Run this to get the public URL:"
  echo "  docker compose logs tunnel | grep trycloudflare.com"
fi

echo ""
echo "Useful commands:"
echo "  docker compose logs -f app     # API logs"
echo "  docker compose logs -f nginx   # nginx logs"
echo "  docker compose down            # stop server"
echo "════════════════════════════════════════════════════════"

exit 0
