# 🚀 Guía de Despliegue Gratuito - Expo Web

Esta guía te ayudará a desplegar tu aplicación Expo Web de forma gratuita en diferentes plataformas.

## 📋 Opciones de Despliegue Gratuito

### 1. **Vercel** (Recomendado) ⭐

Vercel es la opción más fácil y rápida para desplegar aplicaciones Expo Web.

#### Pasos:

1. **Desplegar desde GitHub** (Recomendado):
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Haz clic en "New Project"
   - Importa tu repositorio `Dumplings`
   - Vercel detectará automáticamente la configuración de `vercel.json`
   - **NO cambies ninguna configuración** (ya está todo configurado)
   - Haz clic en "Deploy"

2. **O desplegar desde la terminal**:
   ```bash
   npm i -g vercel
   vercel
   ```
   - Sigue las instrucciones en pantalla
   - Selecciona tu proyecto

#### Ventajas:
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Dominio personalizado gratuito (ej: `tu-app.vercel.app`)
- ✅ Actualizaciones automáticas en cada push

---

### 2. **Netlify**

#### Pasos:

1. **Desplegar desde GitHub**:
   - Ve a [netlify.com](https://netlify.com)
   - Inicia sesión con GitHub
   - Haz clic en "New site from Git"
   - Selecciona tu repositorio `Dumplings`
   - Configuración (ya está en `netlify.toml`, pero verifica):
     - Build command: `npm run build:web`
     - Publish directory: `dist`
   - Haz clic en "Deploy site"

2. **O desplegar desde la terminal**:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod
   ```

#### Ventajas:
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Dominio personalizado gratuito

---

## 🔧 Configuración Previa

### 1. Verificar que el build funciona localmente:

```bash
npm run build:web
```

Esto creará una carpeta `dist` con los archivos estáticos.

### 2. Probar localmente el build:

```bash
npm run preview
```

Esto iniciará un servidor local para probar el build en `http://localhost:3000`.

---

## 📝 Variables de Entorno (si las necesitas)

Si necesitas variables de entorno:

1. **Vercel**:
   - Ve a Project Settings → Environment Variables
   - Agrega tus variables

2. **Netlify**:
   - Ve a Site settings → Build & deploy → Environment
   - Agrega tus variables

---

## 🔄 Actualizaciones Automáticas

### Vercel y Netlify:
- Cada vez que hagas `git push` a la rama principal, se desplegará automáticamente
- Recibirás una URL única para cada despliegue
- La URL de producción se actualizará automáticamente

---

## 🌐 Dominio Personalizado

### Vercel:
1. Ve a Project Settings → Domains
2. Agrega tu dominio
3. Sigue las instrucciones para configurar DNS

### Netlify:
1. Ve a Site settings → Domain management
2. Agrega tu dominio
3. Sigue las instrucciones para configurar DNS

---

## ⚠️ Notas Importantes

1. **AsyncStorage en Web**: 
   - AsyncStorage funciona en web usando `localStorage` automáticamente
   - No requiere configuración adicional

2. **Rutas**:
   - La aplicación usa rutas del lado del cliente
   - Ambas configuraciones (Vercel y Netlify) redirigen todas las rutas a `debug.html`

3. **Build Size**:
   - El build puede ser grande debido a React Native Web
   - Vercel y Netlify manejan esto automáticamente con compresión

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:web
```

### Error: "Build failed"
- Verifica que todos los imports sean correctos
- Asegúrate de que no haya errores de lint
- Revisa los logs de build en la plataforma

### La aplicación no carga
- Verifica que la ruta base esté configurada correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que todos los assets estén incluidos

---

## 📚 Recursos

- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

---

**¡Listo!** Tu aplicación estará disponible en una URL pública gratuita. 🎉
