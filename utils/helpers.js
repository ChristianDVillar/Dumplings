// Funciones de utilidad

/**
 * Compara dos arrays para verificar si son iguales (sin importar el orden)
 */
export const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

/**
 * Calcula el precio total de un item incluyendo extras
 */
export const getTotalPrice = (item, selectedExtras = {}) => {
  if (item.category !== 'PRINCIPALES') {
    return item.price;
  }
  const extras = selectedExtras[item.id] || [];
  return item.price + (extras.length * 1.0);
};

/**
 * Filtra el menú según la consulta de búsqueda
 */
export const filterMenu = (menuData, searchQuery) => {
  if (!searchQuery.trim()) {
    return menuData;
  }

  const query = searchQuery.toLowerCase().trim();
  
  return menuData.filter(item => {
    // Buscar por número
    if (item.number && item.number.toString().includes(query)) {
      return true;
    }
    
    // Buscar por nombre en español
    if (item.nameEs.toLowerCase().includes(query)) {
      return true;
    }
    
    // Buscar por nombre en inglés
    if (item.nameEn.toLowerCase().includes(query)) {
      return true;
    }
    
    // Buscar por descripción en español
    if (item.descriptionEs && item.descriptionEs.toLowerCase().includes(query)) {
      return true;
    }
    
    // Buscar por descripción en inglés
    if (item.descriptionEn && item.descriptionEn.toLowerCase().includes(query)) {
      return true;
    }
    
    // Buscar por categoría
    if (item.category.toLowerCase().includes(query) || 
        item.categoryEn.toLowerCase().includes(query)) {
      return true;
    }
    
    return false;
  });
};

/**
 * Genera el array de mesas disponibles
 */
export const generateTables = () => {
  const { TABLE_CONFIG } = require('./constants');
  const terraceTables = [];
  for (let i = TABLE_CONFIG.TERRACE_START; i <= TABLE_CONFIG.TERRACE_END; i++) {
    terraceTables.push(i);
  }
  const takeawayTables = [];
  for (let i = TABLE_CONFIG.TAKEAWAY_START; i <= TABLE_CONFIG.TAKEAWAY_END; i++) {
    takeawayTables.push(i);
  }
  return {
    regular: TABLE_CONFIG.REGULAR,
    terrace: terraceTables,
    takeaway: takeawayTables
  };
};

/**
 * Normaliza un número de mesa a número para consistencia
 */
export const normalizeTableNumber = (tableNumber) => {
  return Number(tableNumber);
};

/**
 * Obtiene los pedidos de una mesa desde el estado, manejando tanto claves numéricas como string
 */
export const getTableOrdersFromState = (tableOrders, tableNumber) => {
  const table = normalizeTableNumber(tableNumber);
  return tableOrders[table] || tableOrders[String(table)] || [];
};

/**
 * Agrupa un array de mesas en filas de un tamaño específico
 */
export const groupTablesInRows = (tables, itemsPerRow = 10) => {
  const rows = [];
  for (let i = 0; i < tables.length; i += itemsPerRow) {
    rows.push(tables.slice(i, i + itemsPerRow));
  }
  return rows;
};

/**
 * Obtiene estilos de sombra compatibles con web y nativo
 */
export const getShadowStyles = (shadowConfig = {}) => {
  const {
    shadowColor = '#000',
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.3,
    shadowRadius = 4,
    elevation = 3,
    boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.3)'
  } = shadowConfig;

  // Necesitamos importar Platform aquí, pero como es una función helper,
  // mejor pasarlo como parámetro o usar una función que retorne los estilos
  // Por ahora, retornamos un objeto que puede ser usado con Platform.OS
  return {
    web: {
      boxShadow
    },
    native: {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation
    }
  };
};

