/**
 * Utilidades para impresión de comandas
 */

/**
 * Identifica si un item es una ensalada
 */
export const isSalad = (item) => {
  if (!item) return false;
  
  // Verificar por categoría
  if (item.category === 'ENTRANTES') {
    const name = item.nameEs?.toLowerCase() || '';
    return name.includes('ensalada');
  }
  
  return false;
};

/**
 * Identifica si un item es edamame
 */
export const isEdamame = (item) => {
  if (!item) return false;
  
  const name = item.nameEs?.toLowerCase() || '';
  return name.includes('edamame');
};

/**
 * Identifica si un item debe imprimirse automáticamente (ensaladas, edamame, bebidas)
 */
export const shouldAutoPrint = (item, drink = null) => {
  if (!item) return false;
  
  // Si tiene bebida asociada (refrescos)
  if (drink) return true;
  
  // Si es bebida
  if (isDrink(item)) return true;
  
  // Si es ensalada
  if (isSalad(item)) return true;
  
  // Si es edamame
  if (isEdamame(item)) return true;
  
  return false;
};

/**
 * Identifica si un item es una bebida
 */
export const isDrink = (item) => {
  if (!item) return false;
  
  // Verificar por categoría
  if (item.category === 'BEBIDAS') {
    return true;
  }
  
  // Verificar si tiene drink asociado (refrescos)
  return false;
};

/**
 * Filtra pedidos para impresión de ensaladas y bebidas (para camarero)
 */
export const filterSaladsAndDrinks = (orders) => {
  return orders.filter(order => {
    const item = order.item;
    return isSalad(item) || isEdamame(item) || isDrink(item) || order.drink;
  });
};

/**
 * Filtra pedidos para impresión de cocina (todo excepto ensaladas, edamame y bebidas)
 */
export const filterKitchenOrders = (orders) => {
  return orders.filter(order => {
    const item = order.item;
    return !isSalad(item) && !isEdamame(item) && !isDrink(item) && !order.drink;
  });
};

/**
 * Genera datos para impresión de comanda
 */
export const generatePrintData = (tableNumber, orders, type = 'all') => {
  let filteredOrders = orders;
  
  if (type === 'salads_drinks') {
    filteredOrders = filterSaladsAndDrinks(orders);
  } else if (type === 'kitchen') {
    filteredOrders = filterKitchenOrders(orders);
  }
  
  return {
    tableNumber,
    timestamp: new Date().toISOString(),
    orders: filteredOrders,
    totalItems: filteredOrders.reduce((sum, order) => sum + order.quantity, 0),
    type
  };
};

/**
 * Prepara el texto para impresión (formato de comanda profesional)
 */
export const formatPrintText = (printData) => {
  const { tableNumber, timestamp, orders, type } = printData;
  const date = new Date(timestamp);
  const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  // Encabezado de comanda
  let text = `\n`;
  text += `╔═══════════════════════════════════╗\n`;
  text += `║         COMANDA RESTAURANTE       ║\n`;
  text += `╠═══════════════════════════════════╣\n`;
  text += `║ MESA: ${String(tableNumber).padEnd(25)}║\n`;
  text += `║ FECHA: ${dateStr.padEnd(23)}║\n`;
  text += `║ HORA:  ${timeStr.padEnd(24)}║\n`;
  
  if (type === 'kitchen') {
    text += `║ TIPO:  COCINA${' '.repeat(20)}║\n`;
  } else if (type === 'salads_drinks') {
    text += `║ TIPO:  IMPRESIÓN${' '.repeat(16)}║\n`;
  } else {
    text += `║ TIPO:  COMPLETA${' '.repeat(17)}║\n`;
  }
  
  text += `╠═══════════════════════════════════╣\n`;
  text += `║                                   ║\n`;
  
  // Agrupar por categoría
  const grouped = {};
  orders.forEach(order => {
    const category = order.item.category || 'OTROS';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(order);
  });
  
  // Mostrar items agrupados por categoría
  Object.entries(grouped).forEach(([category, categoryOrders]) => {
    text += `║ ┌─ ${category.padEnd(29)}─┐ ║\n`;
    categoryOrders.forEach(order => {
      const qty = `${order.quantity}x`;
      const name = order.item.nameEs.length > 20 
        ? order.item.nameEs.substring(0, 20) + '...'
        : order.item.nameEs;
      const line = `${qty} ${name}`;
      const padding = 33 - line.length;
      text += `║ │ ${line}${' '.repeat(padding)}│ ║\n`;
      
      // Número del item
      if (order.item.number) {
        text += `║ │   #${order.item.number}${' '.repeat(28)}│ ║\n`;
      }
      
      // Extras
      if (order.extras && order.extras.length > 0) {
        const extrasText = `   + ${order.extras.join(', ')}`;
        const extrasLine = extrasText.length > 29 
          ? extrasText.substring(0, 29) + '...'
          : extrasText;
        text += `║ │ ${extrasLine.padEnd(31)}│ ║\n`;
      }
      
      // Bebida
      if (order.drink) {
        const drinkText = `   Bebida: ${order.drink}`;
        const drinkLine = drinkText.length > 29 
          ? drinkText.substring(0, 29) + '...'
          : drinkText;
        text += `║ │ ${drinkLine.padEnd(31)}│ ║\n`;
      }
    });
    text += `║ └${'─'.repeat(31)}┘ ║\n`;
    text += `║                                   ║\n`;
  });
  
  // Total
  const total = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
  text += `╠═══════════════════════════════════╣\n`;
  text += `║ TOTAL: ${total.toFixed(2).padStart(6)}€${' '.repeat(20)}║\n`;
  text += `╚═══════════════════════════════════╝\n`;
  text += `\n`;
  
  return text;
};

