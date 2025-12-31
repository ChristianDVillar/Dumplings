# Compartir localhost con Cloudflare Tunnel

Esta guía te ayudará a compartir tu aplicación que corre en `http://localhost:19006/` usando Cloudflare Tunnel (cloudflared).

## Instalación en Windows

### Opción 1: Instalación automática (Recomendado) ⭐

Ejecuta el script de instalación automática:

```powershell
.\install-cloudflared.ps1
```

Este script:
- Detecta tu arquitectura (32/64 bits)
- Descarga cloudflared automáticamente
- Lo instala en `%USERPROFILE%\cloudflared\`
- Te permite agregarlo al PATH permanentemente

### Opción 2: Descarga directa

1. Descarga cloudflared para Windows desde: https://github.com/cloudflare/cloudflared/releases/latest
2. Busca el archivo `cloudflared-windows-amd64.exe` o `cloudflared-windows-386.exe` (según tu arquitectura)
3. Descarga y renombra el archivo a `cloudflared.exe`
4. Colócalo en una carpeta accesible (por ejemplo, `C:\cloudflared\`) o agrégalo al PATH del sistema

### Opción 3: Usando Chocolatey (si lo tienes instalado)

```powershell
choco install cloudflared
```

### Opción 4: Usando Scoop (si lo tienes instalado)

```powershell
scoop install cloudflared
```

## Uso

### Método 1: Script automatizado (Recomendado) ⭐

Ejecuta el script que detecta automáticamente cloudflared:

```powershell
.\share-localhost.ps1
```

### Método 2: Comando manual

Si cloudflared está en el PATH:

```powershell
cloudflared tunnel --url http://localhost:19006
```

Si está en una ubicación específica (ej: instalación automática):

```powershell
$env:USERPROFILE\cloudflared\cloudflared.exe tunnel --url http://localhost:19006
```

## Resultado

Cloudflare Tunnel generará una URL temporal similar a:

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-words-1234.trycloudflare.com                                               |
+--------------------------------------------------------------------------------------------+
```

Esta URL será accesible desde cualquier dispositivo con conexión a internet.

## Notas importantes

- La URL es **temporal** y cambiará cada vez que reinicies el tunnel
- El tunnel se cerrará cuando cierres la terminal o presiones `Ctrl+C`
- Asegúrate de que tu aplicación esté corriendo en `http://localhost:19006` antes de iniciar el tunnel
- La primera conexión puede tardar unos segundos en establecerse

## Scripts incluidos

Este proyecto incluye dos scripts de PowerShell:

1. **`install-cloudflared.ps1`** - Instala cloudflared automáticamente
2. **`share-localhost.ps1`** - Inicia el tunnel (detecta cloudflared automáticamente)

Ambos scripts son seguros y solo descargan/ejecutan cloudflared desde fuentes oficiales.

