/**
 * Servicio de lógica de negocio para el menú
 * Contiene la lógica de filtrado y búsqueda de items del menú
 */
import { MENU_CATEGORIES, getCategoryDisplayName } from '../utils/menuCategories';
import { isSalad, isEdamame, isDrink, filterKitchenOrders } from '../utils/printHelpers';

class MenuService {
  /**
   * Filtra items del menú por categoría
   * @param {Array} menuItems - Items del menú
   * @param {string} categoryKey - Clave de categoría
   * @returns {Array} - Items filtrados
   */
  filterByCategory(menuItems, categoryKey) {
    if (!categoryKey) return menuItems;
    return menuItems.filter(item => item.category === categoryKey);
  }

  /**
   * Busca items en el menú
   * @param {Array} menuItems - Items del menú
   * @param {string} query - Término de búsqueda
   * @returns {Array} - Items encontrados
   */
  searchItems(menuItems, query) {
    if (!query || !query.trim()) return menuItems;
    
    const searchTerm = query.toLowerCase().trim();
    
    return menuItems.filter(item => {
      // Búsqueda por número
      if (item.number && item.number.toString().includes(searchTerm)) {
        return true;
      }
      
      // Búsqueda por nombre en español
      if (item.nameEs && item.nameEs.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Búsqueda por nombre en inglés
      if (item.nameEn && item.nameEn.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Búsqueda por descripción
      const description = item.descriptionEs || item.description || '';
      if (description.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Búsqueda por categoría
      if (item.category && item.category.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Filtra items habilitados
   * @param {Array} menuItems - Items del menú
   * @returns {Array} - Items habilitados
   */
  filterEnabledItems(menuItems) {
    return menuItems.filter(item => item.enabled !== false);
  }

  /**
   * Obtiene el siguiente número disponible para una categoría
   * @param {Array} menuItems - Items del menú
   * @param {string} category - Categoría
   * @returns {string} - Siguiente número disponible
   */
  getNextNumberForCategory(menuItems, category) {
    const categoryNumberRanges = {
      'ENTRANTES': { start: 1, end: 10 },
      'MO XIAN': { start: 11, end: 20 },
      'GYOZAS A LA PLANCHA': { start: 21, end: 30 },
      'GYOZAS FRITAS': { start: 31, end: 40 },
      'GYOZAS AL VAPOR': { start: 41, end: 50 },
      'DIMSUM': { start: 51, end: 60 },
      'PRINCIPALES': { start: 61, end: 80 },
      'PARA IR CON TODO': { start: 61, end: 70 },
      'BEBIDAS': { start: 71, end: 99 }
    };

    const range = categoryNumberRanges[category];
    if (!range) return '';

    const usedNumbers = menuItems
      .filter(item => {
        const categoriesToCheck = category === 'PRINCIPALES' 
          ? ['PRINCIPALES', 'PARA IR CON TODO']
          : [category];
        return categoriesToCheck.includes(item.category) && item.number;
      })
      .map(item => {
        const num = parseInt(item.number, 10);
        return isNaN(num) ? null : num;
      })
      .filter(num => num !== null && num >= range.start && num <= range.end)
      .sort((a, b) => a - b);

    for (let i = range.start; i <= range.end; i++) {
      if (!usedNumbers.includes(i)) {
        return i.toString().padStart(2, '0');
      }
    }

    return (range.end + 1).toString().padStart(2, '0');
  }

  /**
   * Verifica si un item es de cocina
   * @param {Object} item - Item del menú
   * @returns {boolean} - true si va a cocina
   */
  isKitchenItem(item) {
    if (!item) return false;
    return !isSalad(item) && !isEdamame(item) && !isDrink(item);
  }

  /**
   * Verifica si un item debe imprimirse automáticamente
   * @param {Object} item - Item del menú
   * @param {Object} drink - Bebida asociada
   * @returns {boolean} - true si debe imprimirse
   */
  shouldAutoPrint(item, drink = null) {
    if (!item) return false;
    if (drink) return true;
    return isDrink(item) || isSalad(item) || isEdamame(item);
  }

  /**
   * Filtra órdenes que van a cocina
   * @param {Array} orders - Órdenes
   * @returns {Array} - Órdenes de cocina
   */
  filterKitchenOrders(orders) {
    return filterKitchenOrders(orders);
  }

  /**
   * Agrupa items por categoría
   * @param {Array} menuItems - Items del menú
   * @returns {Object} - Items agrupados por categoría
   */
  groupByCategory(menuItems) {
    const grouped = {};
    menuItems.forEach(item => {
      const category = item.category || 'OTROS';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }
}

export const menuService = new MenuService();

