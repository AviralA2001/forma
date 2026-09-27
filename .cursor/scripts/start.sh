#!/usr/bin/env bash
set -euo pipefail

# Start PostgreSQL if not running
if ! pg_isready -h localhost -q 2>/dev/null; then
  PG_VERSION="$(ls /etc/postgresql 2>/dev/null | head -1 || true)"
  if [[ -n "${PG_VERSION}" ]]; then
    sudo pg_ctlcluster "${PG_VERSION}" main start || sudo service postgresql start
  else
    sudo service postgresql start
  fi
fi

for _ in $(seq 1 30); do
  if pg_isready -h localhost -q; then
    break
  fi
  sleep 1
done

if ! pg_isready -h localhost -q; then
  echo "PostgreSQL failed to become ready" >&2
  exit 1
fi

# Ensure DB credentials match .env.example defaults
sudo -u postgres psql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_roles WHERE rolname = 'postgres'" | grep -q 1 \
  && sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER postgres PASSWORD 'postgres';" || true

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='forma'" | grep -q 1; then
  sudo -u postgres createdb forma
fi
