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
  const [tableKitchenTimestamps, setTableKitchenTimestamps] = useState({}); // Array de timestamps de cuando se enviaron comandas a cocina (múltiples timers por mesa)
  const [completedKitchenOrders, setCompletedKitchenOrders] = useState({}); // Comandas marcadas como completadas: { tableNumber: { timestamp: orderIds[] } }

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

  /**
   * Establece el timestamp de cuando se envió una comanda a cocina
   * Agrega un nuevo timestamp al array en lugar de reemplazar el anterior.
   * Esto permite mantener múltiples timers por mesa (uno por cada envío).
   */
  const setKitchenTimestamp = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    const timestamp = Date.now();
    setTableKitchenTimestamps(prev => {
      const existingTimestamps = prev[table] || [];
      return {
        ...prev,
        [table]: [...existingTimestamps, timestamp] // Agrega nuevo timestamp sin eliminar los anteriores
      };
    });
  };

  /**
   * Obtiene el timestamp más reciente de cuando se envió una comanda a cocina
   * Retorna el último timestamp del array (el más reciente)
   */
  const getKitchenTimestamp = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    const timestamps = tableKitchenTimestamps[table] || tableKitchenTimestamps[String(table)] || [];
    // Retorna el timestamp más reciente (último del array)
    return timestamps.length > 0 ? timestamps[timestamps.length - 1] : null;
  };

  /**
   * Obtiene todos los timestamps de una mesa (para mostrar múltiples timers si es necesario)
   */
  const getAllKitchenTimestamps = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    return tableKitchenTimestamps[table] || tableKitchenTimestamps[String(table)] || [];
  };

  /**
   * Marca una comanda como completada (para el rol de cocina)
   * @param {number} tableNumber - Número de mesa
   * @param {number} timestamp - Timestamp de la comanda a marcar como completada
   */
  const markKitchenOrderCompleted = (tableNumber, timestamp) => {
    const table = normalizeTableNumber(tableNumber);
    console.log('🟡 [TableOrdersContext] markKitchenOrderCompleted INICIO:', { 
      tableNumber, 
      normalizedTable: table, 
      timestamp, 
      timestampType: typeof timestamp,
      timestampString: String(timestamp),
      completedKitchenOrdersBefore: completedKitchenOrders
    });
    
    setCompletedKitchenOrders(prev => {
      const tableCompleted = prev[table] || prev[String(table)] || {};
      console.log('🟡 [TableOrdersContext] Estado previo:', { 
        prev, 
        tableCompleted, 
        table,
        stringTable: String(table),
        hasTable: !!prev[table],
        hasStringTable: !!prev[String(table)]
      });
      
      const newState = {
        ...prev,
        [table]: {
          ...tableCompleted,
          [timestamp]: true,
          [String(timestamp)]: true // Agregar también como string por si acaso
        },
        [String(table)]: { // También guardar con string key
          ...(prev[String(table)] || {}),
          [timestamp]: true,
          [String(timestamp)]: true
        }
      };
      
      console.log('🟡 [TableOrdersContext] Nuevo estado calculado:', newState);
      console.log('🟡 [TableOrdersContext] Verificando nuevo estado para mesa:', {
        table,
        stringTable: String(table),
        newStateTable: newState[table],
        newStateStringTable: newState[String(table)]
      });
      
      return newState;
    });
    
    // Verificar después de un pequeño delay
    setTimeout(() => {
      console.log('🟡 [TableOrdersContext] Estado después de setState (con delay):', completedKitchenOrders);
    }, 100);
  };

  /**
   * Verifica si una comanda está marcada como completada
   * @param {number} tableNumber - Número de mesa
   * @param {number} timestamp - Timestamp de la comanda
   * @returns {boolean} - true si está completada, false si no
   */
  const isKitchenOrderCompleted = (tableNumber, timestamp) => {
    const table = normalizeTableNumber(tableNumber);
    // Intentar con número y string para ambas claves
    const tableCompletedNum = completedKitchenOrders[table] || {};
    const tableCompletedStr = completedKitchenOrders[String(table)] || {};
    const tableCompleted = { ...tableCompletedNum, ...tableCompletedStr };
    
    const isCompleted = tableCompleted[timestamp] === true || 
                       tableCompleted[String(timestamp)] === true ||
                       tableCompletedNum[timestamp] === true ||
                       tableCompletedNum[String(timestamp)] === true ||
                       tableCompletedStr[timestamp] === true ||
                       tableCompletedStr[String(timestamp)] === true;
    
    console.log('🟠 [TableOrdersContext] isKitchenOrderCompleted:', {
      tableNumber,
      normalizedTable: table,
      timestamp,
      timestampType: typeof timestamp,
      tableCompletedNum,
      tableCompletedStr,
      tableCompleted,
      isCompleted,
      completedKitchenOrdersKeys: Object.keys(completedKitchenOrders)
    });
    
    return isCompleted;
  };

  /**
   * Obtiene todas las comandas completadas de una mesa
   */
  const getCompletedKitchenOrders = (tableNumber) => {
    const table = normalizeTableNumber(tableNumber);
    return completedKitchenOrders[table] || completedKitchenOrders[String(table)] || {};
  };

  return (
    <TableOrdersContext.Provider
      value={{
        tableOrders,
        tableHistory,
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
        getTableHistoryTotal,
        setKitchenTimestamp,
        getKitchenTimestamp,
        getAllKitchenTimestamps,
        tableKitchenTimestamps,
        markKitchenOrderCompleted,
        isKitchenOrderCompleted,
        getCompletedKitchenOrders,
        completedKitchenOrders
      }}
    >
      {children}
    </TableOrdersContext.Provider>
  );
};

