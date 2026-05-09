#!/bin/bash
set -e

echo "=== SA Bookings Database Setup ==="

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-sa_bookings}"

export PGPASSWORD="$DB_PASSWORD"

echo "Creating database if it doesn't exist..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"

echo "Running migrations..."
cd backend && npm run migration:run

echo "Running seeds..."
npm run seed

echo "Database setup complete!"
