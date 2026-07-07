#!/bin/sh
set -e

echo "Applying migrations..."
cd /app
./node_modules/.bin/prisma migrate deploy

echo "Starting API..."
exec node /app/dist/server.js
