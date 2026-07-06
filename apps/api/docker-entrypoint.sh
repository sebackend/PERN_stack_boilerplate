#!/bin/sh
set -e

echo "Aplicando migraciones..."
cd /app/apps/api
npx prisma migrate deploy

echo "Iniciando API..."
exec node /app/apps/api/dist/server.js
