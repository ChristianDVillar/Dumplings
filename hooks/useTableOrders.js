import { useState } from 'react';
import { arraysEqual, getTotalPrice } from '../utils/helpers';

/**
 * Hook personalizado para manejar los pedidos de las mesas
 */
export const useTableOrders = () => {
  const [tableOrders, setTableOrders] = useState({});

  /**
   * Agrega un item al pedido de una mesa
   */
  const addItemToTable = (tableNumber, item, selectedExtras = {}, selectedDrink = null) => {
    if (!tableNumber) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }

    const extras = selectedExtras[item.id] || [];
    const drink = selectedDrink || null;
    const price = getTotalPrice(item, selectedExtras);

    setTableOrders(prev => {
      const currentOrders = prev[tableNumber] || [];
      
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
        return {
          ...prev,
          [tableNumber]: updatedOrders
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
        return {
          ...prev,
          [tableNumber]: [...currentOrders, orderItem]
        };
      }
    });
  };

  /**
   * Elimina un item del pedido de una mesa
   */
  const removeItemFromTable = (tableNumber, orderId) => {
    setTableOrders(prev => ({
      ...prev,
      [tableNumber]: (prev[tableNumber] || []).filter(order => order.orderId !== orderId)
    }));
  };

  /**
   * Actualiza la cantidad de un item en el pedido
   */
  const updateItemQuantity = (tableNumber, orderId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromTable(tableNumber, orderId);
      return;
    }
    setTableOrders(prev => ({
      ...prev,
      [tableNumber]: (prev[tableNumber] || []).map(order =>
        order.orderId === orderId ? { ...order, quantity: newQuantity } : order
      )
    }));
  };

  /**
   * Calcula el total del pedido de una mesa
   */
  const getTableTotal = (tableNumber) => {
    const orders = tableOrders[tableNumber] || [];
    return orders.reduce((total, order) => total + (order.price * order.quantity), 0);
  };

  /**
   * Verifica si una mesa está ocupada
   */
  const isTableOccupied = (tableNumber) => {
    return tableOrders[tableNumber] && tableOrders[tableNumber].length > 0;
  };

  /**
   * Limpia todos los pedidos de una mesa
   */
  const clearTable = (tableNumber) => {
    setTableOrders(prev => {
      // Crear un nuevo objeto sin la propiedad de la mesa
      const { [tableNumber]: removed, ...rest } = prev;
      // Siempre devolver un nuevo objeto para que React detecte el cambio
      return { ...rest };
    });
  };

  /**
   * Obtiene los pedidos de una mesa
   */
  const getTableOrders = (tableNumber) => {
    return tableOrders[tableNumber] || [];
  };

  return {
    tableOrders,
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    getTableTotal,
    isTableOccupied,
    clearTable,
    getTableOrders
  };
};

