#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

# PostgreSQL (installed in base image / snapshot)
if ! command -v psql >/dev/null 2>&1; then
  sudo DEBIAN_FRONTEND=noninteractive apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi

pnpm install --frozen-lockfile
pnpm --filter @forma/shared build

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
fi
