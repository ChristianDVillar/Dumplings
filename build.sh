#!/bin/bash
set -e  # Exit on error

echo "🔧 Installing dependencies..."
npm install

echo "🏗️ Building web app..."
npx expo export:web

echo "✅ Verifying build output..."
if [ ! -d "dist" ]; then
  echo "❌ ERROR: dist directory was not created!"
  exit 1
fi

echo "✅ Build completed successfully!"
ls -la dist/

