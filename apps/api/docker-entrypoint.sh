#!/bin/sh
set -e

echo "Applying migrations..."
cd /app/apps/api
npx prisma migrate deploy

echo "Starting API..."
exec node /app/apps/api/dist/server.js
