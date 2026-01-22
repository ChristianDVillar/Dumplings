/**
 * Servidor Express para API REST de productos
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const dbService = require('../database/dbService');

const app = express();
// Usar PORT de Railway/Render o 3001 por defecto para desarrollo local
const PORT = process.env.PORT || 3001;

// Middleware CORS - Permitir todos los orígenes en desarrollo
// En producción, puedes restringir a dominios específicos
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Permitir todos en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========== RUTAS DE PRODUCTOS ==========

/**
 * GET /api/products
 * Obtiene todos los productos
 */
app.get('/api/products', async (req, res) => {
  try {
    const products = await dbService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

/**
 * GET /api/products/:id
 * Obtiene un producto por ID
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const product = await dbService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
});

/**
 * POST /api/products
 * Crea un nuevo producto
 */
app.post('/api/products', async (req, res) => {
  try {
    const product = await dbService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error creando producto' });
  }
});

/**
 * PUT /api/products/:id
 * Actualiza un producto
 */
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const product = await dbService.updateProduct(id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error actualizando producto' });
  }
});

/**
 * DELETE /api/products/:id
 * Elimina un producto
 */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const deleted = await dbService.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error eliminando producto' });
  }
});

// ========== RUTAS DE OPCIONES DE BEBIDAS ==========

/**
 * GET /api/drink-options
 * Obtiene todas las opciones de bebidas
 */
app.get('/api/drink-options', async (req, res) => {
  try {
    const options = await dbService.getAllDrinkOptions();
    res.json(options);
  } catch (error) {
    console.error('Error obteniendo opciones de bebidas:', error);
    res.status(500).json({ error: 'Error obteniendo opciones de bebidas' });
  }
});

/**
 * PUT /api/drink-options
 * Actualiza las opciones de bebidas
 */
app.put('/api/drink-options', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Se espera un array de opciones' });
    }
    
    await dbService.saveDrinkOptions(req.body);
    const options = await dbService.getAllDrinkOptions();
    res.json(options);
  } catch (error) {
    console.error('Error actualizando opciones de bebidas:', error);
    res.status(500).json({ error: 'Error actualizando opciones de bebidas' });
  }
});

// ========== RUTAS DE USUARIOS ==========

/**
 * GET /api/users
 * Obtiene todos los usuarios (sin contraseñas)
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

/**
 * POST /api/users/login
 * Autentica un usuario
 */
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }
    
    const user = await dbService.verifyUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error autenticando usuario:', error);
    res.status(500).json({ error: 'Error autenticando usuario' });
  }
});

/**
 * POST /api/users
 * Crea un nuevo usuario
 */
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password y role son requeridos' });
    }
    
    const user = await dbService.createUser({ username, password, role });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creando usuario:', error);
    if (error.code === '23505') { // Violación de unique constraint
      res.status(409).json({ error: 'El usuario ya existe' });
    } else {
      res.status(500).json({ error: 'Error creando usuario' });
    }
  }
});

/**
 * PUT /api/users/:id
 * Actualiza un usuario
 */
app.put('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const user = await dbService.updateUser(id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

/**
 * DELETE /api/users/:id
 * Elimina un usuario
 */
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const deleted = await dbService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

// ========== RUTA DE SALUD ==========

/**
 * GET /api/health
 * Verifica el estado del servidor y la conexión a la base de datos
 */
app.get('/api/health', async (req, res) => {
  try {
    await dbService.query('SELECT 1');
    
    // Verificar también que las tablas principales existan
    const productsCount = await dbService.query('SELECT COUNT(*) FROM products');
    const usersCount = await dbService.query('SELECT COUNT(*) FROM users');
    const drinkOptionsCount = await dbService.query('SELECT COUNT(*) FROM drink_options');
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      tables: {
        products: parseInt(productsCount.rows[0].count),
        users: parseInt(usersCount.rows[0].count),
        drink_options: parseInt(drinkOptionsCount.rows[0].count)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   GET    /api/products`);
  console.log(`   GET    /api/products/:id`);
  console.log(`   POST   /api/products`);
  console.log(`   PUT    /api/products/:id`);
  console.log(`   DELETE /api/products/:id`);
  console.log(`   GET    /api/drink-options`);
  console.log(`   PUT    /api/drink-options`);
  console.log(`   GET    /api/users`);
  console.log(`   POST   /api/users/login`);
  console.log(`   POST   /api/users`);
  console.log(`   PUT    /api/users/:id`);
  console.log(`   DELETE /api/users/:id`);
  console.log(`   GET    /api/health`);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando conexiones...');
  await dbService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando conexiones...');
  await dbService.close();
  process.exit(0);
});
