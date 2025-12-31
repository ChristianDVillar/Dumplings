/**
 * Utilidades para manejo de tiempo
 */

/**
 * Calcula el tiempo transcurrido desde un timestamp hasta ahora
 * @param {number} timestamp - Timestamp en milisegundos
 * @returns {string} - Tiempo formateado (ej: "5 min", "1h 23min", "2h 5min")
 */
export const getElapsedTime = (timestamp) => {
  if (!timestamp) return null;
  
  const now = Date.now();
  const elapsed = now - timestamp;
  
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${hours}h`;
  }
  
  if (minutes > 0) {
    return `${minutes} min`;
  }
  
  return `${seconds} seg`;
};

/**
 * Formatea el tiempo transcurrido con color según la urgencia
 * @param {number} timestamp - Timestamp en milisegundos
 * @returns {object} - { text: string, color: string }
 */
export const getElapsedTimeWithColor = (timestamp) => {
  if (!timestamp) return { text: 'N/A', color: '#999' };
  
  const now = Date.now();
  const elapsed = now - timestamp;
  const minutes = Math.floor(elapsed / 60000);
  
  const text = getElapsedTime(timestamp);
  
  // Verde: menos de 5 minutos
  if (minutes < 5) {
    return { text, color: '#4CAF50' };
  }
  
  // Amarillo: entre 5 y 15 minutos
  if (minutes < 15) {
    return { text, color: '#FFA500' };
  }
  
  // Rojo: más de 15 minutos
  return { text, color: '#F44336' };
};

