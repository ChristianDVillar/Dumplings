# Configuración de Base de Datos PostgreSQL

Este proyecto ahora utiliza PostgreSQL como base de datos para almacenar los productos del menú.

## Requisitos Previos

- Node.js instalado
- Acceso a la base de datos PostgreSQL (Neon)
- Dependencias de npm instaladas (`npm install`)

## Configuración

1. **Archivo de configuración `.env`**

   El archivo `.env` ya está configurado con la conexión a la base de datos. Si necesitas modificarlo, edita el archivo `.env` en la raíz del proyecto:

   ```
   DATABASE_URL=postgresql://neondb_owner:npg_YBbE1ZIAV6rk@ep-ancient-water-ahg4wh5m-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   PORT=3001
   ```

## Inicialización de la Base de Datos

### 1. Crear las tablas

Ejecuta el siguiente comando para crear las tablas en la base de datos:

```bash
npm run db:init
```

Este comando ejecutará el script `database/schema.sql` que crea:
- Tabla `products` para almacenar los productos del menú
- Tabla `drink_options` para almacenar las opciones de bebidas globales
- Índices para mejorar el rendimiento
- Triggers para actualizar timestamps automáticamente

### 2. Poblar la base de datos

Ejecuta el siguiente comando para insertar todos los productos del menú en la base de datos:

```bash
npm run db:seed
```

Este comando:
- Lee los productos de `menuData.js`
- Los inserta en la base de datos
- Si un producto ya existe, lo actualiza
- Inserta las opciones de bebidas por defecto

## Servidor API

### Iniciar el servidor

Para iniciar el servidor Express que proporciona la API REST:

```bash
npm run server
```

El servidor se iniciará en `http://localhost:3001` (o el puerto configurado en `.env`).

### Endpoints disponibles

#### Productos

- `GET /api/products` - Obtiene todos los productos
- `GET /api/products/:id` - Obtiene un producto por ID
- `POST /api/products` - Crea un nuevo producto
- `PUT /api/products/:id` - Actualiza un producto
- `DELETE /api/products/:id` - Elimina un producto

#### Opciones de Bebidas

- `GET /api/drink-options` - Obtiene todas las opciones de bebidas
- `PUT /api/drink-options` - Actualiza las opciones de bebidas (envía un array)

#### Salud del Sistema

- `GET /api/health` - Verifica el estado del servidor y la conexión a la base de datos

## Estructura de la Base de Datos

### Tabla `products`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único del producto (clave primaria) |
| number | VARCHAR(10) | Número del producto en el menú |
| category | VARCHAR(100) | Categoría en español |
| category_en | VARCHAR(100) | Categoría en inglés |
| name_es | VARCHAR(200) | Nombre en español |
| name_en | VARCHAR(200) | Nombre en inglés |
| description_es | TEXT | Descripción en español |
| description_en | TEXT | Descripción en inglés |
| price | DECIMAL(10,2) | Precio del producto |
| quantity | VARCHAR(50) | Cantidad (ej: "10 uds.") |
| customizable | BOOLEAN | Si el producto es personalizable |
| enabled | BOOLEAN | Si el producto está habilitado |
| option_groups | JSONB | Grupos de opciones (para combos) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Tabla `drink_options`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único (clave primaria) |
| name | VARCHAR(100) | Nombre de la opción de bebida |
| order_index | INTEGER | Orden de visualización |
| created_at | TIMESTAMP | Fecha de creación |

## Uso desde la Aplicación React Native

Para conectar la aplicación React Native con la base de datos, necesitarás:

1. **Configurar la URL del servidor API** en tu aplicación
2. **Crear un servicio de API** que haga llamadas HTTP a los endpoints
3. **Actualizar MenuContext** para usar el servicio de API en lugar de AsyncStorage

### Ejemplo de servicio de API

```javascript
// services/apiService.js
const API_URL = 'http://localhost:3001/api'; // Cambiar por la URL de producción

export const apiService = {
  async getProducts() {
    const response = await fetch(`${API_URL}/products`);
    return await response.json();
  },
  
  async updateProduct(id, data) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  // ... más métodos
};
```

## Notas Importantes

- El servidor API debe estar corriendo para que la aplicación pueda acceder a los datos
- Para producción, asegúrate de configurar CORS correctamente y usar HTTPS
- Considera usar variables de entorno para la URL del API en diferentes entornos (desarrollo, producción)
- El archivo `.env` está en `.gitignore` por seguridad - no lo subas al repositorio

## Solución de Problemas

### Error de conexión a la base de datos

- Verifica que la URL de conexión en `.env` sea correcta
- Asegúrate de que la base de datos esté accesible desde tu red
- Verifica los parámetros SSL si es necesario

### Error al ejecutar el seed

- Asegúrate de que las tablas estén creadas primero (`npm run db:init`)
- Verifica que `menuData.js` tenga el formato correcto
- Revisa los logs para ver qué producto está causando el error

### El servidor no inicia

- Verifica que el puerto 3001 (o el configurado) no esté en uso
- Revisa que todas las dependencias estén instaladas (`npm install`)
- Verifica que el archivo `.env` exista y tenga la configuración correcta
