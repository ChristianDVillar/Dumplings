#!/bin/bash
# Script para compartir localhost:19006 con Cloudflare Tunnel
# Uso: ./share-localhost.sh

echo "🚀 Iniciando Cloudflare Tunnel para localhost:19006..."
echo ""

# Verificar si cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared no está instalado."
    echo ""
    echo "Por favor, instala cloudflared primero:"
    echo "  macOS: brew install cloudflared"
    echo "  Linux: Descarga desde https://github.com/cloudflare/cloudflared/releases/latest"
    echo ""
    exit 1
fi

# Verificar si el puerto 19006 está en uso (solo en Linux/macOS)
if command -v lsof &> /dev/null; then
    if ! lsof -Pi :19006 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Advertencia: No se detecta actividad en el puerto 19006"
        echo "   Asegúrate de que tu aplicación React Native esté corriendo."
        echo ""
        read -p "¿Deseas continuar de todas formas? (s/n): " continue
        if [ "$continue" != "s" ] && [ "$continue" != "S" ]; then
            exit 0
        fi
    fi
fi

echo "✅ cloudflared encontrado"
echo "🌐 Iniciando tunnel..."
echo ""
echo "Presiona Ctrl+C para detener el tunnel"
echo ""

# Iniciar cloudflared tunnel
cloudflared tunnel --url http://localhost:19006

