import React, { createContext, useContext, useState } from 'react';
import { arraysEqual, getTotalPrice, normalizeTableNumber, getTableOrdersFromState } from '../utils/helpers';

const TableOrdersContext = createContext();

export const useTableOrdersContext = () => {
  const context = useContext(TableOrdersContext);
  if (!context) {
    throw new Error('useTableOrdersContext must be used within TableOrdersProvider');
  }
  return context;
};

export const TableOrdersProvider = ({ children }) => {
  const [tableOrders, setTableOrders] = useState({});
  const [tableHistory, setTableHistory] = useState({});
  const [tableDiscounts, setTableDiscounts] = useState({});

  /**
   * Agrega un item al pedido de una mesa
   */
  const addItemToTable = (tableNumber, item, selectedExtras = {}, selectedDrink = null) => {
    if (!tableNumber) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }

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
      const existingOrderIndex = currentOrders.findIndex(
        order => order.id === item.id &&
        arraysEqual(order.extras || [], extras) &&
        order.drink === drink
      );

      if (existingOrderIndex >= 0) {
        const updatedOrders = [...currentOrders];
        updatedOrders[existingOrderIndex] = {
          ...updatedOrders[existingOrderIndex],
          quantity: updatedOrders[existingOrderIndex].quantity + 1
        };
        return {
          ...prev,
          [table]: updatedOrders
        };
      } else {
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
    return orders && orders.length > 0;
  };

  /**
   * Limpia todos los pedidos de una mesa
   */
  const clearTable = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    setTableOrders(prev => {
      const { [table]: removed1, [String(table)]: removed2, ...rest } = prev;
      return { ...rest };
    });
  };

  /**
   * Obtiene los pedidos de una mesa
   */
  const getTableOrders = (tableNumber) => {
    return getTableOrdersFromState(tableOrders, tableNumber);
  };

  /**
   * Cambia los pedidos de una mesa a otra
   */
  const moveTableOrders = (fromTable, toTable) => {
    const from = normalizeTableNumber(fromTable);
    const to = normalizeTableNumber(toTable);
    
    if (from === to) return false;
    
    const orders = getTableOrdersFromState(tableOrders, from);
    if (orders.length === 0) return false;
    
    setTableOrders(prev => {
      const { [from]: removed, ...rest } = prev;
      const existingOrders = getTableOrdersFromState(rest, to);
      return {
        ...rest,
        [to]: [...existingOrders, ...orders]
      };
    });
    
    return true;
  };

  /**
   * Establece un descuento para una mesa
   */
  const setTableDiscount = (tableNumber, discount) => {
    const table = normalizeTableNumber(tableNumber);
    setTableDiscounts(prev => ({
      ...prev,
      [table]: discount
    }));
  };

  /**
   * Obtiene el descuento de una mesa
   */
  const getTableDiscount = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    return tableDiscounts[table] || 0;
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
    const orders = getTableOrdersFromState(tableOrders, tableNumber);
    const discount = getTableDiscount(tableNumber);
    const tableTotal = getTableTotal(tableNumber);
    
    let itemsToPay = [];
    let remainingItems = [];
    
    if (orderIds === null) {
      itemsToPay = [...orders];
    } else {
      itemsToPay = orders.filter(order => orderIds.includes(order.orderId));
      remainingItems = orders.filter(order => !orderIds.includes(order.orderId));
    }

    if (itemsToPay.length === 0) {
      return;
    }

    const subtotal = itemsToPay.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    
    let discountAmount = 0;
    if (orderIds === null) {
      discountAmount = discount;
    } else if (tableTotal > 0) {
      discountAmount = (discount * subtotal) / tableTotal;
    }
    
    const totalPaid = Math.max(0, subtotal - discountAmount);

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

    if (orderIds === null) {
      clearTable(tableNumber);
      setTableDiscounts(prev => {
        const { [tableNumber]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setTableOrders(prev => ({
        ...prev,
        [tableNumber]: remainingItems
      }));
      
      if (remainingItems.length === 0) {
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
   * Obtiene el total histórico de una mesa
   */
  const getTableHistoryTotal = (tableNumber) => {
    const history = getTableHistory(tableNumber);
    return history.reduce((sum, payment) => sum + payment.total, 0);
  };

  return (
    <TableOrdersContext.Provider
      value={{
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
      }}
    >
      {children}
    </TableOrdersContext.Provider>
  );
};

