#!/bin/sh
set -e

echo "Applying database schema..."

if npx prisma migrate deploy; then
  echo "Migrations applied."
else
  echo "migrate deploy failed — syncing schema..."

  if ! npx prisma db push --accept-data-loss --skip-generate; then
    echo "db push failed (old UserRole enum) — running role migration SQL..."
    npx prisma db execute --schema prisma/schema.prisma \
      --file prisma/migrations/20260704120000_align_user_roles/migration.sql
    npx prisma db push --accept-data-loss --skip-generate
  fi

  npx prisma migrate resolve --applied 20260704120000_align_user_roles || true
fi

echo "Seeding database..."
node dist/prisma/seed.js

echo "Starting API server..."
exec node dist/src/main
