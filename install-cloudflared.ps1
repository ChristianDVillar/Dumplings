# Script para instalar cloudflared automaticamente en Windows
# Uso: .\install-cloudflared.ps1

Write-Host "Instalador de Cloudflare Tunnel (cloudflared)" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya esta instalado
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
if ($cloudflaredPath) {
    Write-Host "cloudflared ya esta instalado en: $($cloudflaredPath.Source)" -ForegroundColor Green
    Write-Host ""
    $reinstall = Read-Host "Deseas reinstalarlo? (s/n)"
    if ($reinstall -ne "s" -and $reinstall -ne "S") {
        exit 0
    }
}

# Crear directorio de instalacion
$installDir = "$env:USERPROFILE\cloudflared"
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    Write-Host "Directorio creado: $installDir" -ForegroundColor Green
}

# Detectar arquitectura
$arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "386" }
Write-Host "Arquitectura detectada: $arch" -ForegroundColor Cyan

# URL de descarga
$downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-$arch.exe"
$exePath = "$installDir\cloudflared.exe"

Write-Host ""
Write-Host "Descargando cloudflared..." -ForegroundColor Yellow
Write-Host "URL: $downloadUrl" -ForegroundColor Gray

try {
    # Descargar cloudflared
    Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing
    
    Write-Host "Descarga completada: $exePath" -ForegroundColor Green
    Write-Host ""
    
    # Verificar version
    Write-Host "Verificando instalacion..." -ForegroundColor Cyan
    $version = & $exePath --version 2>&1
    Write-Host "Version: $version" -ForegroundColor Green
    Write-Host ""
    
    # Agregar al PATH del usuario (solo para esta sesion)
    $env:Path += ";$installDir"
    
    Write-Host "Opciones para usar cloudflared:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Opcion 1: Usar la ruta completa" -ForegroundColor Yellow
    Write-Host "   $exePath tunnel --url http://localhost:19006" -ForegroundColor White
    Write-Host ""
    Write-Host "   Opcion 2: Agregar al PATH permanentemente" -ForegroundColor Yellow
    Write-Host "   1. Abre 'Variables de entorno' en Windows" -ForegroundColor White
    Write-Host "   2. Edita la variable PATH del usuario" -ForegroundColor White
    Write-Host "   3. Agrega: $installDir" -ForegroundColor White
    Write-Host ""
    Write-Host "   Opcion 3: Usar el script share-localhost.ps1 (ya actualizado)" -ForegroundColor Yellow
    Write-Host ""
    
    # Preguntar si quiere agregar al PATH permanentemente
    $addToPath = Read-Host "Deseas agregar cloudflared al PATH permanentemente? (s/n)"
    if ($addToPath -eq "s" -or $addToPath -eq "S") {
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$installDir*") {
            [Environment]::SetEnvironmentVariable("Path", "$currentPath;$installDir", "User")
            Write-Host "Agregado al PATH. Reinicia PowerShell para usar 'cloudflared' directamente." -ForegroundColor Green
        } else {
            Write-Host "Ya esta en el PATH." -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Instalacion completada!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para compartir localhost, ejecuta:" -ForegroundColor Cyan
    Write-Host "   $exePath tunnel --url http://localhost:19006" -ForegroundColor White
    Write-Host ""
    Write-Host "O usa el script: .\share-localhost.ps1" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "Error durante la descarga:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalacion manual:" -ForegroundColor Yellow
    Write-Host "1. Visita: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor White
    Write-Host "2. Descarga: cloudflared-windows-$arch.exe" -ForegroundColor White
    Write-Host "3. Renombralo a cloudflared.exe y colocarlo en: $installDir" -ForegroundColor White
    exit 1
}
