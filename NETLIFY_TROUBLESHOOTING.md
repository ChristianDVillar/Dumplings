# 🔧 Troubleshooting Netlify Build

Si el build falla en Netlify, sigue estos pasos:

## 📋 Paso 1: Ver los Logs Completos

1. Ve a tu sitio en Netlify
2. Haz clic en **"Deploys"**
3. Selecciona el deploy fallido
4. **Copia TODOS los logs** (especialmente las líneas que muestran errores)
5. Comparte los logs para diagnóstico

## 🔍 Paso 2: Verificar Build Local

Ejecuta estos comandos localmente:

```bash
# Limpiar
rm -rf node_modules dist package-lock.json

# Reinstalar
npm install

# Probar build
npm run build:web

# Verificar
ls dist  # o dir dist en Windows
```

Si el build funciona localmente pero falla en Netlify, el problema es del entorno.

## 🛠️ Paso 3: Soluciones Comunes

### Error: "Cannot find module"
```bash
# En netlify.toml, agregar:
[build.environment]
  NPM_FLAGS = "--legacy-peer-deps"
```

### Error: "Out of memory"
```bash
# En netlify.toml, agregar:
[build.environment]
  NODE_OPTIONS = "--max-old-space-size=4096"
```

### Error: "Build script returned non-zero exit code: 2"
- Revisa los logs completos para ver el error específico
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que no haya errores de sintaxis

## 🚀 Alternativa: Usar Vercel

Si Netlify sigue dando problemas, **Vercel tiene mejor soporte para Expo**:

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. "New Project" → Importa `Dumplings`
4. Haz clic en "Deploy"

La configuración en `vercel.json` ya está lista y funcionará mejor.

## 📞 Necesitas Ayuda?

Comparte:
1. Los logs completos del build en Netlify
2. El resultado de `npm run build:web` localmente
3. Cualquier error específico que veas

