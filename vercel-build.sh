#!/bin/bash
set -e

echo "Building for Vercel..."

# Instalar dependencias
npm install --legacy-peer-deps

# Construir la aplicación
npm run build:web

# Verificar qué directorio se creó y renombrar si es necesario
if [ -d "web-build" ]; then
  echo "Found web-build, renaming to dist..."
  if [ -d "dist" ]; then
    rm -rf dist
  fi
  mv web-build dist
elif [ ! -d "dist" ]; then
  echo "ERROR: No build directory found!"
  exit 1
fi

echo "Build complete! Output in dist/"
