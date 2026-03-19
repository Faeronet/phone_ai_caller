#!/bin/sh
set -eu

echo "Starting Next.js..."
cd /app/frontend
exec npm run start

