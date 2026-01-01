# 🚀 Despliegue Rápido - 3 Pasos

## Opción 1: Vercel (Más Fácil) ⭐

### Paso 1: Ve a [vercel.com](https://vercel.com)
### Paso 2: Inicia sesión con GitHub
### Paso 3: 
- Haz clic en "New Project"
- Importa tu repositorio `Dumplings`
- **NO cambies ninguna configuración** (ya está todo configurado)
- Haz clic en "Deploy"

✅ **¡Listo!** Tu app estará en línea en menos de 2 minutos.

---

## Opción 2: Netlify

### Paso 1: Ve a [netlify.com](https://netlify.com)
### Paso 2: Inicia sesión con GitHub
### Paso 3:
- Haz clic en "New site from Git"
- Selecciona tu repositorio `Dumplings`
- Configuración:
  - Build command: `npm run build:web`
  - Publish directory: `dist`
- Haz clic en "Deploy site"

✅ **¡Listo!** Tu app estará en línea.

---

## 🔧 Verificar Build Localmente

Antes de desplegar, puedes probar el build localmente:

```bash
npm run build:web
npm run preview
```

Esto iniciará un servidor local en `http://localhost:3000` para probar.

---

## 📝 Notas

- ✅ El build ya está configurado y funcionando
- ✅ Los archivos de configuración (`vercel.json` y `netlify.toml`) ya están creados
- ✅ Cada vez que hagas `git push`, se desplegará automáticamente
- ✅ Obtendrás una URL pública gratuita (ej: `tu-app.vercel.app`)

---

## 🆘 ¿Problemas?

Si el despliegue falla:
1. Verifica que el build funcione localmente: `npm run build:web`
2. Revisa los logs en la plataforma de despliegue
3. Asegúrate de que todos los cambios estén en GitHub

---

**¡Tu aplicación estará en línea en minutos!** 🎉

