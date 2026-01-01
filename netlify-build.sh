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
if [ ! -d "dist" ]; then
  echo "❌ ERROR: dist directory was not created!"
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

