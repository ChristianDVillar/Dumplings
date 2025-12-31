import { useState } from 'react';
import { arraysEqual, getTotalPrice, normalizeTableNumber, getTableOrdersFromState } from '../utils/helpers';

/**
 * Hook personalizado para manejar los pedidos de las mesas
 */
export const useTableOrders = () => {
  const [tableOrders, setTableOrders] = useState({});
  const [tableHistory, setTableHistory] = useState({}); // Historial de pagos por mesa
  const [tableDiscounts, setTableDiscounts] = useState({}); // Descuentos por mesa

  /**
   * Agrega un item al pedido de una mesa
   */
  const addItemToTable = (tableNumber, item, selectedExtras = {}, selectedDrink = null) => {
    if (!tableNumber) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }

    // Normalizar el número de mesa a número para consistencia
    const table = normalizeTableNumber(tableNumber);
    if (isNaN(table)) {
      alert('Número de mesa inválido');
      return;
    }

    const extras = selectedExtras[item.id] || [];
    const drink = selectedDrink || null;
    const price = getTotalPrice(item, selectedExtras);

    setTableOrders(prev => {
      const currentOrders = prev[table] || [];
      console.log('🔍 [useTableOrders] addItemToTable - Estado previo:', {
        table,
        currentOrdersCount: currentOrders.length,
        currentOrders: currentOrders.map(o => ({ id: o.item.id, name: o.item.nameEs, quantity: o.quantity }))
      });
      
      // Buscar si ya existe un item idéntico (mismo item, mismos extras, mismo refresco)
      const existingOrderIndex = currentOrders.findIndex(order => {
        const sameItem = order.id === item.id;
        const sameExtras = arraysEqual(order.extras, extras);
        const sameDrink = (order.drink || null) === (drink || null);
        return sameItem && sameExtras && sameDrink;
      });

      if (existingOrderIndex !== -1) {
        // Si existe un item idéntico, incrementar la cantidad
        const updatedOrders = [...currentOrders];
        updatedOrders[existingOrderIndex] = {
          ...updatedOrders[existingOrderIndex],
          quantity: updatedOrders[existingOrderIndex].quantity + 1
        };
        console.log('🔍 [useTableOrders] Item existente, incrementando cantidad:', {
          table,
          itemId: item.id,
          newQuantity: updatedOrders[existingOrderIndex].quantity
        });
        return {
          ...prev,
          [table]: updatedOrders
        };
      } else {
        // Si no existe, agregar un nuevo item
        const orderId = Date.now() + Math.random();
        const orderItem = {
          id: item.id,
          orderId,
          item,
          quantity: 1,
          extras: [...extras],
          drink: drink,
          price
        };
        console.log('🔍 [useTableOrders] Nuevo item agregado:', {
          table,
          orderId,
          itemId: item.id,
          itemName: item.nameEs,
          quantity: 1,
          totalOrdersAfter: currentOrders.length + 1
        });
        return {
          ...prev,
          [table]: [...currentOrders, orderItem]
        };
      }
    });
  };

  /**
   * Elimina un item del pedido de una mesa
   */
  const removeItemFromTable = (tableNumber, orderId) => {
    const table = normalizeTableNumber(tableNumber);
    setTableOrders(prev => {
      const currentOrders = getTableOrdersFromState(prev, table);
      return {
        ...prev,
        [table]: currentOrders.filter(order => order.orderId !== orderId)
      };
    });
  };

  /**
   * Actualiza la cantidad de un item en el pedido
   */
  const updateItemQuantity = (tableNumber, orderId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromTable(tableNumber, orderId);
      return;
    }
    const table = normalizeTableNumber(tableNumber);
    setTableOrders(prev => {
      const currentOrders = getTableOrdersFromState(prev, table);
      return {
        ...prev,
        [table]: currentOrders.map(order =>
          order.orderId === orderId ? { ...order, quantity: newQuantity } : order
        )
      };
    });
  };

  /**
   * Calcula el total del pedido de una mesa
   */
  const getTableTotal = (tableNumber) => {
    const orders = getTableOrdersFromState(tableOrders, tableNumber);
    return orders.reduce((total, order) => total + (order.price * order.quantity), 0);
  };

  /**
   * Verifica si una mesa está ocupada
   */
  const isTableOccupied = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    const orders = getTableOrdersFromState(tableOrders, table);
    const isOccupied = orders && orders.length > 0;
    console.log('🔍 [useTableOrders] isTableOccupied:', {
      tableNumber,
      table,
      ordersCount: orders ? orders.length : 0,
      isOccupied
    });
    return isOccupied;
  };

  /**
   * Limpia todos los pedidos de una mesa
   */
  const clearTable = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    setTableOrders(prev => {
      // Crear un nuevo objeto sin la propiedad de la mesa (tanto número como string)
      const { [table]: removed1, [String(table)]: removed2, ...rest } = prev;
      // Siempre devolver un nuevo objeto para que React detecte el cambio
      return { ...rest };
    });
  };

  /**
   * Obtiene los pedidos de una mesa
   */
  const getTableOrders = (tableNumber) => {
    const orders = getTableOrdersFromState(tableOrders, tableNumber);
    console.log('🔍 [useTableOrders] getTableOrders:', {
      tableNumber,
      ordersCount: orders.length,
      orders: orders.map(o => ({ id: o.item.id, name: o.item.nameEs, quantity: o.quantity }))
    });
    return orders;
  };

  /**
   * Cambia los pedidos de una mesa a otra
   */
  const moveTableOrders = (fromTable, toTable) => {
    // Normalizar los números de mesa a números para asegurar consistencia
    const from = Number(fromTable);
    const to = Number(toTable);
    
    if (!from || !to || from === to || isNaN(from) || isNaN(to)) {
      return false;
    }
    
    // Verificar primero si hay pedidos usando el estado actual
    // Esto es necesario porque setState es asíncrono y necesitamos saber si hay pedidos antes de intentar mover
    const currentOrders = getTableOrdersFromState(tableOrders, from);
    
    if (currentOrders.length === 0) {
      return false; // No hay pedidos para mover
    }
    
    // Mover los pedidos usando el estado previo
    setTableOrders(prev => {
      // Buscar pedidos en la mesa origen (probar con número y string)
      const ordersToMove = prev[from] || prev[String(from)] || [];
      
      if (ordersToMove.length === 0) {
        return prev; // No hay pedidos para mover (esto no debería pasar si la verificación anterior fue correcta)
      }
      
      // Crear nuevo estado sin la mesa origen
      const newState = { ...prev };
      
      // Eliminar la mesa origen (tanto número como string)
      if (newState.hasOwnProperty(from)) {
        delete newState[from];
      }
      if (newState.hasOwnProperty(String(from))) {
        delete newState[String(from)];
      }
      
      // Obtener pedidos existentes en la mesa destino (probar con número y string)
      const existingOrders = newState[to] || newState[String(to)] || [];
      
      // Agregar pedidos a la mesa destino usando la clave numérica
      const combinedOrders = [...existingOrders, ...ordersToMove];
      
      // Asignar usando la clave numérica
      // NO eliminar la clave string después de asignar la clave numérica
      // En JavaScript, delete obj["11"] puede eliminar obj[11] también
      // Como ya asignamos usando la clave numérica, no necesitamos eliminar la string
      // La clave numérica tiene prioridad y funcionará correctamente
      newState[to] = combinedOrders;
      
      return newState;
    });

    // Mover también el descuento si existe
    setTableDiscounts(prev => {
      const discountToMove = prev[from] || prev[String(from)] || 0;
      if (discountToMove === 0 && !prev[from] && !prev[String(from)]) {
        return prev; // No hay descuento para mover
      }
      
      const newState = { ...prev };
      delete newState[from];
      delete newState[String(from)];
      
      const existingDiscount = newState[to] || newState[String(to)] || 0;
      newState[to] = existingDiscount + discountToMove;
      
      if (newState[String(to)]) {
        delete newState[String(to)];
      }
      
      return newState;
    });

    return true;
  };

  /**
   * Establece un descuento para una mesa
   */
  const setTableDiscount = (tableNumber, discount) => {
    setTableDiscounts(prev => ({
      ...prev,
      [tableNumber]: discount
    }));
  };

  /**
   * Obtiene el descuento de una mesa
   */
  const getTableDiscount = (tableNumber) => {
    return tableDiscounts[tableNumber] || 0;
  };

  /**
   * Calcula el total con descuento
   */
  const getTableTotalWithDiscount = (tableNumber) => {
    const total = getTableTotal(tableNumber);
    const discount = getTableDiscount(tableNumber);
    return Math.max(0, total - discount);
  };

  /**
   * Paga items seleccionados o toda la cuenta
   */
  const payTableItems = (tableNumber, orderIds = null) => {
    const orders = tableOrders[tableNumber] || [];
    const discount = getTableDiscount(tableNumber);
    const tableTotal = getTableTotal(tableNumber);
    
    let itemsToPay = [];
    let remainingItems = [];
    
    if (orderIds === null) {
      // Pagar toda la cuenta
      itemsToPay = [...orders];
    } else {
      // Pagar solo items seleccionados
      itemsToPay = orders.filter(order => orderIds.includes(order.orderId));
      remainingItems = orders.filter(order => !orderIds.includes(order.orderId));
    }

    if (itemsToPay.length === 0) {
      return;
    }

    const subtotal = itemsToPay.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    
    // Calcular descuento proporcional si se pagan items seleccionados
    let discountAmount = 0;
    if (orderIds === null) {
      // Pagar todo: usar todo el descuento
      discountAmount = discount;
    } else if (tableTotal > 0) {
      // Pagar parcial: calcular descuento proporcional
      discountAmount = (discount * subtotal) / tableTotal;
    }
    
    const totalPaid = Math.max(0, subtotal - discountAmount);

    // Guardar en historial
    const paymentRecord = {
      id: Date.now(),
      tableNumber,
      items: itemsToPay,
      subtotal,
      discount: discountAmount,
      total: totalPaid,
      timestamp: new Date().toISOString()
    };

    setTableHistory(prev => ({
      ...prev,
      [tableNumber]: [...(prev[tableNumber] || []), paymentRecord]
    }));

    // Actualizar pedidos y descuento
    if (orderIds === null) {
      // Limpiar toda la mesa
      clearTable(tableNumber);
      setTableDiscounts(prev => {
        const { [tableNumber]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      // Eliminar solo items pagados y ajustar descuento
      setTableOrders(prev => ({
        ...prev,
        [tableNumber]: remainingItems
      }));
      
      // Ajustar descuento restante proporcionalmente
      const remainingTotal = remainingItems.reduce((sum, order) => sum + (order.price * order.quantity), 0);
      if (remainingTotal > 0 && tableTotal > 0) {
        const remainingDiscount = discount - discountAmount;
        setTableDiscounts(prev => ({
          ...prev,
          [tableNumber]: remainingDiscount
        }));
      } else {
        // Si no quedan items, eliminar descuento
        setTableDiscounts(prev => {
          const { [tableNumber]: removed, ...rest } = prev;
          return rest;
        });
      }
    }

    return paymentRecord;
  };

  /**
   * Obtiene el historial de pagos de una mesa
   */
  const getTableHistory = (tableNumber) => {
    return tableHistory[tableNumber] || [];
  };

  /**
   * Obtiene el total histórico de una mesa (suma de todos los pagos)
   */
  const getTableHistoryTotal = (tableNumber) => {
    const history = getTableHistory(tableNumber);
    return history.reduce((sum, payment) => sum + payment.total, 0);
  };

  return {
    tableOrders,
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    getTableTotal,
    isTableOccupied,
    clearTable,
    getTableOrders,
    moveTableOrders,
    setTableDiscount,
    getTableDiscount,
    getTableTotalWithDiscount,
    payTableItems,
    getTableHistory,
    getTableHistoryTotal
  };
};

