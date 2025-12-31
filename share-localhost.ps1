# Script para compartir localhost:19006 con Cloudflare Tunnel
# Uso: .\share-localhost.ps1

Write-Host "🚀 Iniciando Cloudflare Tunnel para localhost:19006..." -ForegroundColor Cyan
Write-Host ""

# Verificar si cloudflared está instalado
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
$cloudflaredExe = $null

# Si no está en PATH, buscar en ubicación común
if (-not $cloudflaredPath) {
    $commonPaths = @(
        "$env:USERPROFILE\cloudflared\cloudflared.exe",
        "$env:ProgramFiles\cloudflared\cloudflared.exe",
        "$env:LOCALAPPDATA\cloudflared\cloudflared.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $cloudflaredExe = $path
            Write-Host "✅ cloudflared encontrado en: $path" -ForegroundColor Green
            break
        }
    }
    
    if (-not $cloudflaredExe) {
        Write-Host "❌ cloudflared no se encuentra." -ForegroundColor Red
        Write-Host ""
        Write-Host "Por favor, instala cloudflared primero:" -ForegroundColor Yellow
        Write-Host "   Ejecuta: .\install-cloudflared.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "O manualmente:" -ForegroundColor Yellow
        Write-Host "1. Descarga desde: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Yellow
        Write-Host "2. Extrae cloudflared.exe y colócalo en una carpeta del PATH" -ForegroundColor Yellow
        Write-Host "   O usa: choco install cloudflared (si tienes Chocolatey)" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
} else {
    $cloudflaredExe = $cloudflaredPath.Source
}

# Verificar si el puerto 19006 está en uso
$portCheck = Test-NetConnection -ComputerName localhost -Port 19006 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $portCheck) {
    Write-Host "⚠️  Advertencia: No se detecta actividad en el puerto 19006" -ForegroundColor Yellow
    Write-Host "   Asegúrate de que tu aplicación React Native esté corriendo." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "¿Deseas continuar de todas formas? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
}

Write-Host "🌐 Iniciando tunnel..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el tunnel" -ForegroundColor Yellow
Write-Host ""

# Iniciar cloudflared tunnel
Write-Host "Ejecutando: $cloudflaredExe tunnel --url http://localhost:19006" -ForegroundColor Gray
Write-Host ""

& $cloudflaredExe tunnel --url http://localhost:19006

