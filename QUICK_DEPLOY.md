# 🚀 Despliegue Rápido en Netlify - 3 Pasos

## Paso 1: Ve a [netlify.com](https://netlify.com)
## Paso 2: Inicia sesión con GitHub
## Paso 3:
- Haz clic en "New site from Git"
- Selecciona tu repositorio `Dumplings`
- **NO cambies ninguna configuración** (ya está todo configurado en `netlify.toml`)
- Haz clic en "Deploy site"

✅ **¡Listo!** Tu app estará en línea en menos de 2 minutos.

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
- ✅ El archivo de configuración (`netlify.toml`) ya está creado
- ✅ Cada vez que hagas `git push`, se desplegará automáticamente
- ✅ Obtendrás una URL pública gratuita (ej: `tu-app.netlify.app`)

---

## 🆘 ¿Problemas?

Si el despliegue falla:
1. Verifica que el build funcione localmente: `npm run build:web`
2. Revisa los logs en Netlify (Deploys → selecciona el deploy fallido)
3. Asegúrate de que todos los cambios estén en GitHub

---

**¡Tu aplicación estará en línea en minutos!** 🎉
