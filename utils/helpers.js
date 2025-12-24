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
  const regularTables = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
  const takeawayTables = [];
  for (let i = 200; i <= 240; i++) {
    takeawayTables.push(i);
  }
  return {
    regular: regularTables,
    takeaway: takeawayTables
  };
};

