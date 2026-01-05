#!/bin/bash
set -e  # Exit on error

echo "=========================================="
echo "🔧 Starting Netlify Build"
echo "=========================================="

echo "📦 Node version:"
node --version

echo "📦 NPM version:"
npm --version

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps || npm install

echo "📦 Dependencies installed successfully"

echo "🏗️ Building web app with Expo..."
npx expo export:web || {
  echo "❌ expo export:web failed, trying alternative..."
  npx expo export --platform web || {
    echo "❌ All build commands failed!"
    echo "📋 Listing current directory:"
    ls -la
    echo "📋 Checking if dist exists:"
    ls -la dist || echo "dist does not exist"
    exit 1
  }
}

echo "✅ Build command completed"

echo "📋 Verifying build output..."
# Expo puede crear 'web-build' o 'dist', verificar ambos
if [ -d "web-build" ]; then
  echo "✅ Found web-build directory"
  # Eliminar dist si existe para evitar conflictos
  if [ -d "dist" ]; then
    echo "🗑️ Removing existing dist directory..."
    rm -rf dist
  fi
  echo "📦 Renaming web-build to dist..."
  mv web-build dist
elif [ -d "dist" ]; then
  echo "✅ Found dist directory"
else
  echo "❌ ERROR: Neither dist nor web-build directory was created!"
  echo "📋 Current directory contents:"
  ls -la
  exit 1
fi

echo "📋 dist directory contents:"
ls -la dist/

echo "✅ Build verification passed!"
echo "=========================================="
echo "🎉 Build completed successfully!"
echo "=========================================="

