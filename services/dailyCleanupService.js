/**
 * Servicio de limpieza diaria
 * Se encarga de limpiar las comandas activas a las 00:00 manteniendo el historial para estadísticas
 */

class DailyCleanupService {
  constructor() {
    this.lastCleanupDate = null;
    this.checkInterval = null;
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   * @returns {string} - Fecha actual
   */
  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Verifica si es medianoche (00:00)
   * @returns {boolean} - true si es medianoche
   */
  isMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() === 0;
  }

  /**
   * Verifica si ha cambiado el día
   * @returns {boolean} - true si cambió el día desde la última limpieza
   */
  hasDayChanged() {
    const currentDate = this.getCurrentDate();
    if (!this.lastCleanupDate) {
      this.lastCleanupDate = currentDate;
      return false;
    }
    
    if (this.lastCleanupDate !== currentDate) {
      this.lastCleanupDate = currentDate;
      return true;
    }
    
    return false;
  }

  /**
   * Inicia el monitoreo de limpieza diaria
   * Verifica cada minuto si es medianoche y si ha cambiado el día
   * @param {Function} cleanupCallback - Función a ejecutar cuando se detecta cambio de día
   */
  startMonitoring(cleanupCallback) {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    // Verificar inmediatamente si es necesario limpiar
    if (this.hasDayChanged()) {
      cleanupCallback();
    }

    // Verificar cada minuto
    this.checkInterval = setInterval(() => {
      if (this.hasDayChanged()) {
        cleanupCallback();
      }
    }, 60000); // 60000 ms = 1 minuto
  }

  /**
   * Detiene el monitoreo de limpieza diaria
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Carga la última fecha de limpieza desde localStorage
   * @returns {Promise<string|null>} - Última fecha de limpieza o null
   */
  async loadLastCleanupDate() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('@dumplings:lastCleanupDate');
        return stored || null;
      }
      return null;
    } catch (error) {
      console.error('[DailyCleanupService] Error cargando última fecha de limpieza:', error);
      return null;
    }
  }

  /**
   * Guarda la última fecha de limpieza en localStorage
   * @param {string} date - Fecha a guardar
   */
  async saveLastCleanupDate(date) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('@dumplings:lastCleanupDate', date);
      }
    } catch (error) {
      console.error('[DailyCleanupService] Error guardando última fecha de limpieza:', error);
    }
  }

  /**
   * Inicializa el servicio cargando la última fecha de limpieza
   */
  async initialize() {
    const storedDate = await this.loadLastCleanupDate();
    if (storedDate) {
      this.lastCleanupDate = storedDate;
    } else {
      this.lastCleanupDate = this.getCurrentDate();
      await this.saveLastCleanupDate(this.lastCleanupDate);
    }
  }
}

export const dailyCleanupService = new DailyCleanupService();

