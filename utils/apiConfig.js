/**
 * Configuración de la API
 * Centraliza la configuración de la URL del servidor API
 */

// Detectar si estamos en desarrollo o producción
const isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

// URL base de la API según el entorno
export const API_CONFIG = {
  // URL para desarrollo local
  DEVELOPMENT: 'http://localhost:3001/api',
  
  // URL para producción - ACTUALIZAR cuando despliegues el servidor API
  // Opciones: Railway, Render, Heroku, etc.
  // Ejemplo: 'https://dumplings-api.railway.app/api'
  PRODUCTION: process.env.REACT_APP_API_URL || 
              (typeof window !== 'undefined' && window.REACT_APP_API_URL) ||
              null, // null = usar modo offline
  
  // Detectar automáticamente la URL
  getApiUrl() {
    // Si hay una URL configurada en variables de entorno, usarla
    if (this.PRODUCTION && this.PRODUCTION !== 'https://your-api-domain.com/api') {
      return this.PRODUCTION;
    }
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Si estamos en localhost, usar el servidor local
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        return this.DEVELOPMENT;
      }
      // En producción web sin URL configurada, retornar null para usar modo offline
      return null;
    }
    
    // Para React Native
    return isDevelopment ? this.DEVELOPMENT : (this.PRODUCTION || null);
  }
};

// Exportar la URL de la API (puede ser null si no está configurada)
export const API_URL = API_CONFIG.getApiUrl();

// URL base sin /api para health checks
export const API_BASE_URL = API_URL ? API_URL.replace('/api', '') : null;
