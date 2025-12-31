/**
 * Servicio de lógica de negocio para estadísticas
 * Calcula estadísticas de pedidos y ventas
 */

class StatisticsService {
  /**
   * Calcula estadísticas por categoría de pedidos activos
   * @param {Object} tableOrders - Pedidos de todas las mesas
   * @param {Function} getTableOrders - Función para obtener pedidos de una mesa
   * @param {Function} isTableOccupied - Función para verificar si una mesa está ocupada
   * @param {Array} allTables - Array de todas las mesas
   * @returns {Object} - Estadísticas agrupadas por categoría
   */
  calculateDailyStatsByCategory(tableOrders, getTableOrders, isTableOccupied, allTables) {
    const stats = {};
    
    allTables.forEach(table => {
      if (!isTableOccupied(table)) return;
      
      const tableOrdersList = getTableOrders(table);
      tableOrdersList.forEach(order => {
        const category = order.item.category || 'OTROS';
        if (!stats[category]) {
          stats[category] = { name: category, total: 0 };
        }
        stats[category].total += order.quantity;
      });
    });
    
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }

  /**
   * Calcula estadísticas por item individual de pedidos activos
   * @param {Object} tableOrders - Pedidos de todas las mesas
   * @param {Function} getTableOrders - Función para obtener pedidos de una mesa
   * @param {Function} isTableOccupied - Función para verificar si una mesa está ocupada
   * @param {Array} allTables - Array de todas las mesas
   * @returns {Object} - Estadísticas agrupadas por categoría con items individuales
   */
  calculateDailyStatsByItem(tableOrders, getTableOrders, isTableOccupied, allTables) {
    const stats = {};
    
    allTables.forEach(table => {
      if (!isTableOccupied(table)) return;
      
      const tableOrdersList = getTableOrders(table);
      tableOrdersList.forEach(order => {
        const itemId = order.item.id;
        const itemName = order.item.nameEs || 'Sin nombre';
        const category = order.item.category || 'OTROS';
        
        if (!stats[itemId]) {
          stats[itemId] = {
            id: itemId,
            name: itemName,
            nameEn: order.item.nameEn,
            category: category,
            total: 0,
            price: order.price || order.item.price || 0
          };
        }
        stats[itemId].total += order.quantity;
      });
    });
    
    // Agrupar por categoría
    const groupedByCategory = {};
    Object.values(stats).forEach(stat => {
      if (!groupedByCategory[stat.category]) {
        groupedByCategory[stat.category] = [];
      }
      groupedByCategory[stat.category].push(stat);
    });
    
    // Ordenar cada categoría por cantidad
    Object.keys(groupedByCategory).forEach(category => {
      groupedByCategory[category].sort((a, b) => b.total - a.total);
    });
    
    return groupedByCategory;
  }

  /**
   * Calcula estadísticas históricas desde el historial de pagos
   * @param {Object} tableHistory - Historial de todas las mesas
   * @param {Function} getTableHistory - Función para obtener historial de una mesa
   * @param {Array} allTables - Array de todas las mesas
   * @returns {Object} - Estadísticas históricas
   */
  calculateHistoricalStats(tableHistory, getTableHistory, allTables) {
    const categoryStats = {};
    let totalItems = 0;
    let totalRevenue = 0;
    let totalDiscounts = 0;
    let totalPayments = 0;

    allTables.forEach(table => {
      const history = getTableHistory(table);
      if (history && history.length > 0) {
        history.forEach(payment => {
          totalPayments++;
          totalRevenue += payment.total || 0;
          totalDiscounts += payment.discount || 0;

          if (payment.items && Array.isArray(payment.items)) {
            payment.items.forEach(order => {
              if (order.item) {
                const category = order.item.category || 'OTROS';
                if (!categoryStats[category]) {
                  categoryStats[category] = {
                    name: category,
                    total: 0,
                    revenue: 0
                  };
                }
                const quantity = order.quantity || 1;
                const price = order.price || 0;
                categoryStats[category].total += quantity;
                categoryStats[category].revenue += price * quantity;
                totalItems += quantity;
              }
            });
          }
        });
      }
    });

    return {
      categoryStats: Object.values(categoryStats).sort((a, b) => b.total - a.total),
      totals: {
        items: totalItems,
        revenue: totalRevenue,
        discounts: totalDiscounts,
        payments: totalPayments
      }
    };
  }
}

export const statisticsService = new StatisticsService();

