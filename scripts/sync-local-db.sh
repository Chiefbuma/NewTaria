#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker exec -i newtaria-mysql-local mysql -uroot -psecret -D NewTariaDB < "$ROOT_DIR/scripts/local-db-sync.sql"
