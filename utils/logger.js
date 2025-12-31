/**
 * Sistema de logging para desarrollo y producción
 */

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

/**
 * Logger para desarrollo - solo muestra logs en modo desarrollo
 */
export const logger = {
  /**
   * Log de información general
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log('ℹ️', ...args);
    }
  },

  /**
   * Log de depuración
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log('🔍', ...args);
    }
  },

  /**
   * Log de advertencia
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('⚠️', ...args);
    }
  },

  /**
   * Log de error
   */
  error: (...args) => {
    // Los errores siempre se muestran
    console.error('❌', ...args);
  },

  /**
   * Log de impresión (para comandas)
   */
  print: (...args) => {
    if (isDevelopment) {
      console.log('🖨️', ...args);
    }
  },

  /**
   * Log de cocina
   */
  kitchen: (...args) => {
    if (isDevelopment) {
      console.log('👨‍🍳', ...args);
    }
  }
};

