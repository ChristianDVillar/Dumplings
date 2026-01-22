# Integración con Base de Datos PostgreSQL

La aplicación ahora está completamente integrada con PostgreSQL a través de una API REST.

## Arquitectura

```
React Native App (Frontend)
    ↓ HTTP Requests
API Service (services/apiService.js)
    ↓ API Calls
Express Server (server/index.js)
    ↓ SQL Queries
PostgreSQL Database (Neon)
```

## Configuración

### 1. Servidor API

El servidor API debe estar corriendo para que la aplicación funcione con la base de datos:

```bash
npm run server
```

El servidor se ejecuta en `http://localhost:3001` por defecto.

### 2. URL de la API

La URL de la API se configura automáticamente según el entorno:

- **Desarrollo**: `http://localhost:3001/api`
- **Producción**: Debes actualizar `utils/apiConfig.js` con la URL de tu servidor en producción

Para cambiar la URL de producción, edita `utils/apiConfig.js`:

```javascript
export const API_CONFIG = {
  PRODUCTION: 'https://tu-servidor.com/api', // Cambiar esta URL
  // ...
};
```

### 3. Fallback Local

Si la API no está disponible, la aplicación automáticamente:
1. Usa datos almacenados localmente (AsyncStorage)
2. Continúa funcionando normalmente
3. Intenta reconectar con la API cuando sea posible

## Funcionalidades

### Sincronización Automática

- Los cambios en productos se sincronizan automáticamente con la base de datos
- Los cambios en opciones de bebidas se sincronizan automáticamente
- Se guarda un backup local de todos los datos

### Operaciones Soportadas

- ✅ Cargar productos desde la base de datos
- ✅ Crear nuevos productos
- ✅ Actualizar productos existentes
- ✅ Eliminar productos
- ✅ Gestionar opciones de bebidas
- ✅ Sincronización automática con debounce

## Estado de la Conexión

El `MenuContext` expone el estado de la conexión:

```javascript
const { apiAvailable, useApi, setUseApi } = useMenuContext();
```

- `apiAvailable`: Indica si la API está disponible
- `useApi`: Flag para forzar el uso de la API o el modo offline
- `setUseApi`: Función para cambiar el modo

## Desarrollo

### Iniciar el servidor de desarrollo

```bash
# Terminal 1: Servidor API
npm run server

# Terminal 2: Aplicación React Native
npm start
```

### Verificar conexión

La aplicación verifica automáticamente la conexión al iniciar. Puedes ver el estado en la consola:

```
[MenuContext] Cargando datos desde la API...
[MenuContext] Datos cargados desde la API exitosamente
```

O si la API no está disponible:

```
[MenuContext] Usando datos locales (API no disponible)
```

## Producción

### Desplegar el servidor API

1. Despliega el servidor Express en un servicio como:
   - Heroku
   - Railway
   - Render
   - AWS
   - DigitalOcean

2. Actualiza la URL en `utils/apiConfig.js`:

```javascript
PRODUCTION: 'https://tu-servidor-api.herokuapp.com/api'
```

3. Asegúrate de que:
   - CORS esté configurado correctamente
   - La base de datos PostgreSQL esté accesible
   - Las variables de entorno estén configuradas

### Variables de Entorno del Servidor

El servidor necesita estas variables de entorno (en `.env`):

```
DATABASE_URL=postgresql://...
PORT=3001
```

## Solución de Problemas

### La aplicación no se conecta a la API

1. Verifica que el servidor esté corriendo: `npm run server`
2. Verifica la URL en `utils/apiConfig.js`
3. Revisa la consola del navegador para errores de CORS
4. Verifica que el puerto 3001 no esté bloqueado por un firewall

### Los datos no se sincronizan

1. Verifica que `apiAvailable` sea `true` en el contexto
2. Revisa los logs del servidor para errores
3. Verifica la conexión a la base de datos
4. Los cambios se sincronizan con un debounce de 2 segundos

### Error de CORS

Si ves errores de CORS, verifica que el servidor tenga CORS habilitado. El servidor ya incluye CORS configurado, pero si despliegas en un dominio diferente, asegúrate de actualizar la configuración en `server/index.js`.

## Migración desde AsyncStorage

La aplicación mantiene compatibilidad con AsyncStorage como fallback. Los datos se migran automáticamente:

1. Al iniciar, intenta cargar desde la API
2. Si falla, carga desde AsyncStorage
3. Si hay datos en AsyncStorage, los sincroniza con la API cuando sea posible
4. Siempre mantiene un backup local

## Próximos Pasos

- [ ] Implementar sincronización incremental (solo cambios)
- [ ] Agregar indicador visual del estado de conexión
- [ ] Implementar cola de sincronización para modo offline
- [ ] Agregar autenticación si es necesario
- [ ] Implementar caché inteligente
