/**
 * Configuración de categorías del menú agrupadas
 */
export const MENU_CATEGORIES = {
  ENTRANTES: {
    key: 'ENTRANTES',
    nameEs: 'Entrantes',
    nameEn: 'Starters',
    order: 1
  },
  GYOZAS_PLANCHA: {
    key: 'GYOZAS A LA PLANCHA',
    nameEs: 'Gyozas a la Plancha',
    nameEn: 'Grilled Gyozas',
    order: 2
  },
  GYOZAS_FRITA: {
    key: 'GYOZAS FRITAS',
    nameEs: 'Gyozas Fritas',
    nameEn: 'Fried Gyozas',
    order: 3
  },
  GYOZAS_VAPOR: {
    key: 'GYOZAS AL VAPOR',
    nameEs: 'Gyozas al Vapor',
    nameEn: 'Steamed Gyozas',
    order: 4
  },
  DIMSUMS: {
    key: 'DIMSUM',
    nameEs: 'Dim Sums',
    nameEn: 'Dim Sums',
    order: 5
  },
  PRINCIPALES: {
    key: 'PRINCIPALES',
    nameEs: 'Platos Principales',
    nameEn: 'Main Dishes',
    order: 6
  },
  COMBOS: {
    key: 'COMBOS',
    nameEs: 'Combos',
    nameEn: 'Combos',
    order: 7
  },
  BEBIDAS: {
    key: 'BEBIDAS',
    nameEs: 'Bebidas',
    nameEn: 'Drinks',
    order: 8
  }
};

/**
 * Agrupa los items del menú por categoría
 */
export const groupMenuByCategory = (menuData) => {
  const grouped = {};
  
  menuData.forEach(item => {
    // Mapear categorías a las claves de MENU_CATEGORIES
    let categoryKey = item.category;
    
    // Normalizar categorías
    if (categoryKey === 'GYOZAS A LA PLANCHA') {
      categoryKey = MENU_CATEGORIES.GYOZAS_PLANCHA.key;
    } else if (categoryKey === 'GYOZAS FRITAS') {
      categoryKey = MENU_CATEGORIES.GYOZAS_FRITA.key;
    } else if (categoryKey === 'GYOZAS AL VAPOR') {
      categoryKey = MENU_CATEGORIES.GYOZAS_VAPOR.key;
    } else if (categoryKey === 'DIMSUM') {
      categoryKey = MENU_CATEGORIES.DIMSUMS.key;
    }
    
    if (!grouped[categoryKey]) {
      grouped[categoryKey] = [];
    }
    grouped[categoryKey].push(item);
  });
  
  // Ordenar categorías según el orden definido
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const catA = Object.values(MENU_CATEGORIES).find(cat => cat.key === a);
    const catB = Object.values(MENU_CATEGORIES).find(cat => cat.key === b);
    const orderA = catA ? catA.order : 999;
    const orderB = catB ? catB.order : 999;
    return orderA - orderB;
  });
  
  return {
    grouped,
    sortedCategories
  };
};

/**
 * Obtiene el nombre de la categoría para mostrar
 */
export const getCategoryDisplayName = (categoryKey, language = 'es') => {
  const category = Object.values(MENU_CATEGORIES).find(cat => cat.key === categoryKey);
  if (category) {
    return language === 'es' ? category.nameEs : category.nameEn;
  }
  return categoryKey;
};

