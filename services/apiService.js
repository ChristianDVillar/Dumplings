/**
 * Servicio de API para comunicarse con el backend PostgreSQL
 * Maneja todas las llamadas HTTP a la API REST
 */

import { API_URL, API_BASE_URL } from '../utils/apiConfig';

class ApiService {
  /**
   * Realiza una petición HTTP
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<any>} - Respuesta de la API
   */
  async request(endpoint, options = {}) {
    // Si no hay URL configurada, lanzar error para que se use fallback local
    if (!API_URL) {
      throw new Error('API URL no configurada - usando modo offline');
    }
    
    const url = `${API_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[ApiService] Error en ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si la API está disponible
   * @returns {Promise<boolean>} - true si la API está disponible
   */
  async checkHealth() {
    // Si no hay URL configurada, retornar false (modo offline)
    if (!API_BASE_URL) {
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // ========== OPERACIONES DE PRODUCTOS ==========

  /**
   * Obtiene todos los productos
   * @returns {Promise<Array>} - Lista de productos
   */
  async getProducts() {
    return this.request('/products');
  }

  /**
   * Obtiene un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} - Producto
   */
  async getProductById(id) {
    return this.request(`/products/${id}`);
  }

  /**
   * Crea un nuevo producto
   * @param {Object} product - Datos del producto
   * @returns {Promise<Object>} - Producto creado
   */
  async createProduct(product) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  /**
   * Actualiza un producto
   * @param {number} id - ID del producto
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object>} - Producto actualizado
   */
  async updateProduct(id, updates) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Elimina un producto
   * @param {number} id - ID del producto
   * @returns {Promise<void>}
   */
  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== OPERACIONES DE OPCIONES DE BEBIDAS ==========

  /**
   * Obtiene todas las opciones de bebidas
   * @returns {Promise<Array>} - Lista de opciones de bebidas
   */
  async getDrinkOptions() {
    return this.request('/drink-options');
  }

  /**
   * Actualiza las opciones de bebidas
   * @param {Array<string>} options - Lista de opciones
   * @returns {Promise<Array>} - Opciones actualizadas
   */
  async updateDrinkOptions(options) {
    return this.request('/drink-options', {
      method: 'PUT',
      body: JSON.stringify(options),
    });
  }
}

export const apiService = new ApiService();
