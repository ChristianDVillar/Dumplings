/**
 * Servicio de lógica de negocio para órdenes
 * Contiene la lógica de cálculo y validación de pedidos
 */
import { EXTRA_PRICE } from '../utils/constants';

class OrderService {
  /**
   * Calcula el precio total de un item con extras
   * @param {Object} item - Item del menú
   * @param {Object} selectedExtras - Extras seleccionados
   * @returns {number} - Precio total
   */
  calculateItemPrice(item, selectedExtras = {}) {
    if (item.category !== 'PRINCIPALES') {
      return item.price;
    }
    const extras = selectedExtras[item.id] || [];
    return item.price + (extras.length * EXTRA_PRICE);
  }

  /**
   * Calcula el subtotal de una orden
   * @param {Array} orders - Array de órdenes
   * @returns {number} - Subtotal
   */
  calculateSubtotal(orders) {
    if (!Array.isArray(orders)) return 0;
    return orders.reduce((total, order) => {
      return total + (order.price * order.quantity);
    }, 0);
  }

  /**
   * Calcula el total con descuento
   * @param {number} subtotal - Subtotal
   * @param {number} discount - Descuento aplicado
   * @returns {number} - Total con descuento
   */
  calculateTotalWithDiscount(subtotal, discount) {
    return Math.max(0, subtotal - discount);
  }

  /**
   * Calcula el descuento proporcional para pagos parciales
   * @param {number} tableTotal - Total de la mesa
   * @param {number} tableDiscount - Descuento total de la mesa
   * @param {number} itemsSubtotal - Subtotal de los items a pagar
   * @returns {number} - Descuento proporcional
   */
  calculateProportionalDiscount(tableTotal, tableDiscount, itemsSubtotal) {
    if (tableTotal <= 0) return 0;
    return (tableDiscount * itemsSubtotal) / tableTotal;
  }

  /**
   * Valida si un número de mesa es válido
   * @param {any} tableNumber - Número de mesa
   * @returns {boolean} - true si es válido
   */
  isValidTableNumber(tableNumber) {
    if (!tableNumber) return false;
    const table = parseInt(tableNumber, 10);
    return !isNaN(table) && table > 0;
  }

  /**
   * Normaliza un número de mesa
   * @param {any} tableNumber - Número de mesa
   * @returns {number|null} - Número normalizado o null si es inválido
   */
  normalizeTableNumber(tableNumber) {
    if (!tableNumber) return null;
    const table = parseInt(tableNumber, 10);
    return isNaN(table) ? null : table;
  }

  /**
   * Crea un registro de pago
   * @param {number} tableNumber - Número de mesa
   * @param {Array} items - Items pagados
   * @param {number} subtotal - Subtotal
   * @param {number} discount - Descuento
   * @param {number} total - Total
   * @returns {Object} - Registro de pago
   */
  createPaymentRecord(tableNumber, items, subtotal, discount, total) {
    return {
      id: Date.now(),
      tableNumber,
      items: [...items], // Copia del array
      subtotal,
      discount,
      total,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calcula el total histórico de una mesa
   * @param {Array} history - Historial de pagos
   * @returns {number} - Total histórico
   */
  calculateHistoryTotal(history) {
    if (!Array.isArray(history)) return 0;
    return history.reduce((total, payment) => total + (payment.total || 0), 0);
  }

  /**
   * Verifica si una mesa tiene pedidos activos
   * @param {Array} orders - Órdenes de la mesa
   * @returns {boolean} - true si tiene pedidos
   */
  hasActiveOrders(orders) {
    return Array.isArray(orders) && orders.length > 0;
  }
}

export const orderService = new OrderService();

