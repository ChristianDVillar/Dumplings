/**
 * Servicio de base de datos PostgreSQL
 * Maneja todas las conexiones y operaciones con la base de datos
 */
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión desde la variable de entorno
const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_YBbE1ZIAV6rk@ep-ancient-water-ahg4wh5m-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Crear pool de conexiones
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Manejar errores del pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

class DatabaseService {
  /**
   * Ejecuta una query
   * @param {string} text - Query SQL
   * @param {Array} params - Parámetros de la query
   * @returns {Promise} - Resultado de la query
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Obtiene un cliente del pool para transacciones
   * @returns {Promise<Client>} - Cliente de PostgreSQL
   */
  async getClient() {
    return await pool.connect();
  }

  /**
   * Inicializa las tablas de la base de datos
   * @returns {Promise<void>}
   */
  async initializeTables() {
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    try {
      await this.query(schema);
      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  /**
   * Cierra todas las conexiones del pool
   */
  async close() {
    await pool.end();
  }

  // ========== OPERACIONES DE PRODUCTOS ==========

  /**
   * Obtiene todos los productos
   * @returns {Promise<Array>} - Lista de productos
   */
  async getAllProducts() {
    const result = await this.query(
      'SELECT * FROM products ORDER BY id ASC'
    );
    return result.rows.map(this.mapProductFromDb);
  }

  /**
   * Obtiene un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object|null>} - Producto o null
   */
  async getProductById(id) {
    const result = await this.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? this.mapProductFromDb(result.rows[0]) : null;
  }

  /**
   * Crea un nuevo producto
   * @param {Object} product - Datos del producto
   * @returns {Promise<Object>} - Producto creado
   */
  async createProduct(product) {
    const {
      id,
      number,
      category,
      categoryEn,
      nameEs,
      nameEn,
      descriptionEs,
      descriptionEn,
      price,
      quantity,
      customizable,
      enabled,
      optionGroups
    } = product;

    const result = await this.query(
      `INSERT INTO products (
        id, number, category, category_en, name_es, name_en,
        description_es, description_en, price, quantity,
        customizable, enabled, option_groups
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        id,
        number,
        category,
        categoryEn,
        nameEs,
        nameEn,
        descriptionEs || null,
        descriptionEn || null,
        price,
        quantity || null,
        customizable || false,
        enabled !== undefined ? enabled : true,
        optionGroups ? JSON.stringify(optionGroups) : null
      ]
    );
    return this.mapProductFromDb(result.rows[0]);
  }

  /**
   * Actualiza un producto
   * @param {number} id - ID del producto
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object|null>} - Producto actualizado o null
   */
  async updateProduct(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      number: 'number',
      category: 'category',
      categoryEn: 'category_en',
      nameEs: 'name_es',
      nameEn: 'name_en',
      descriptionEs: 'description_es',
      descriptionEn: 'description_en',
      price: 'price',
      quantity: 'quantity',
      customizable: 'customizable',
      enabled: 'enabled',
      optionGroups: 'option_groups'
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMapping[key] !== undefined) {
        const dbField = fieldMapping[key];
        fields.push(`${dbField} = $${paramIndex}`);
        
        if (key === 'optionGroups' && value) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return await this.getProductById(id);
    }

    values.push(id);
    const result = await this.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows.length > 0 ? this.mapProductFromDb(result.rows[0]) : null;
  }

  /**
   * Elimina un producto
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteProduct(id) {
    const result = await this.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Mapea un producto de la base de datos al formato de la aplicación
   * @param {Object} row - Fila de la base de datos
   * @returns {Object} - Producto en formato de aplicación
   */
  mapProductFromDb(row) {
    return {
      id: row.id,
      number: row.number,
      category: row.category,
      categoryEn: row.category_en,
      nameEs: row.name_es,
      nameEn: row.name_en,
      descriptionEs: row.description_es,
      descriptionEn: row.description_en,
      price: parseFloat(row.price),
      quantity: row.quantity,
      customizable: row.customizable || false,
      enabled: row.enabled !== undefined ? row.enabled : true,
      optionGroups: row.option_groups ? (typeof row.option_groups === 'string' ? JSON.parse(row.option_groups) : row.option_groups) : null
    };
  }

  // ========== OPERACIONES DE OPCIONES DE BEBIDAS ==========

  /**
   * Obtiene todas las opciones de bebidas
   * @returns {Promise<Array>} - Lista de opciones de bebidas
   */
  async getAllDrinkOptions() {
    const result = await this.query(
      'SELECT name FROM drink_options ORDER BY order_index ASC, id ASC'
    );
    return result.rows.map(row => row.name);
  }

  /**
   * Guarda las opciones de bebidas (reemplaza todas)
   * @param {Array<string>} options - Lista de opciones
   * @returns {Promise<void>}
   */
  async saveDrinkOptions(options) {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      
      // Eliminar todas las opciones existentes
      await client.query('DELETE FROM drink_options');
      
      // Insertar las nuevas opciones
      for (let i = 0; i < options.length; i++) {
        await client.query(
          'INSERT INTO drink_options (name, order_index) VALUES ($1, $2)',
          [options[i], i]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ========== OPERACIONES DE USUARIOS ==========

  /**
   * Obtiene todos los usuarios
   * @returns {Promise<Array>} - Lista de usuarios (sin contraseñas)
   */
  async getAllUsers() {
    const result = await this.query(
      'SELECT id, username, role, enabled, created_at, updated_at FROM users ORDER BY username ASC'
    );
    return result.rows;
  }

  /**
   * Obtiene un usuario por username
   * @param {string} username - Nombre de usuario
   * @returns {Promise<Object|null>} - Usuario o null
   */
  async getUserByUsername(username) {
    const result = await this.query(
      'SELECT id, username, password_hash, role, enabled FROM users WHERE username = $1',
      [username.toLowerCase()]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Verifica las credenciales de un usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object|null>} - Usuario si las credenciales son correctas, null si no
   */
  async verifyUser(username, password) {
    const bcrypt = require('bcrypt');
    const user = await this.getUserByUsername(username);
    
    if (!user || !user.enabled) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }
    
    // Devolver usuario sin la contraseña
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      enabled: user.enabled
    };
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.username - Nombre de usuario
   * @param {string} userData.password - Contraseña en texto plano
   * @param {string} userData.role - Rol del usuario
   * @returns {Promise<Object>} - Usuario creado (sin contraseña)
   */
  async createUser(userData) {
    const bcrypt = require('bcrypt');
    const { username, password, role } = userData;
    
    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const result = await this.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, enabled, created_at',
      [username.toLowerCase(), passwordHash, role]
    );
    
    return result.rows[0];
  }

  /**
   * Actualiza un usuario
   * @param {number} id - ID del usuario
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object|null>} - Usuario actualizado o null
   */
  async updateUser(id, updates) {
    const bcrypt = require('bcrypt');
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.username !== undefined) {
      fields.push(`username = $${paramIndex}`);
      values.push(updates.username.toLowerCase());
      paramIndex++;
    }

    if (updates.password !== undefined) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(updates.password, saltRounds);
      fields.push(`password_hash = $${paramIndex}`);
      values.push(passwordHash);
      paramIndex++;
    }

    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex}`);
      values.push(updates.role);
      paramIndex++;
    }

    if (updates.enabled !== undefined) {
      fields.push(`enabled = $${paramIndex}`);
      values.push(updates.enabled);
      paramIndex++;
    }

    if (fields.length === 0) {
      return await this.getUserByUsername((await this.query('SELECT username FROM users WHERE id = $1', [id])).rows[0]?.username);
    }

    values.push(id);
    const result = await this.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, role, enabled, updated_at`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Elimina un usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteUser(id) {
    const result = await this.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = new DatabaseService();
