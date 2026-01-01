# PowerShell build script for Windows
$ErrorActionPreference = "Stop"

Write-Host "🔧 Installing dependencies..."
npm install

Write-Host "🏗️ Building web app..."
npx expo export:web

Write-Host "✅ Verifying build output..."
if (-not (Test-Path "dist")) {
    Write-Host "❌ ERROR: dist directory was not created!"
    exit 1
}

Write-Host "✅ Build completed successfully!"
Get-ChildItem dist

