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
  
  // URL para producción - CAMBIAR ESTA URL cuando despliegues el servidor
  PRODUCTION: 'https://your-api-domain.com/api',
  
  // Detectar automáticamente la URL
  getApiUrl() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Si estamos en localhost, usar el servidor local
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        return this.DEVELOPMENT;
      }
      // En producción web, intentar usar el mismo host con puerto 3001
      // O usar la URL de producción configurada
      return this.PRODUCTION;
    }
    
    // Para React Native
    return isDevelopment ? this.DEVELOPMENT : this.PRODUCTION;
  }
};

// Exportar la URL de la API
export const API_URL = API_CONFIG.getApiUrl();

// URL base sin /api para health checks
export const API_BASE_URL = API_URL.replace('/api', '');
