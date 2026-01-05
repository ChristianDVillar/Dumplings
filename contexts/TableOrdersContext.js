import React, { createContext, useContext, useState, useEffect } from 'react';
import { arraysEqual, getTableOrdersFromState } from '../utils/helpers';
import { storageService } from '../services/storageService';
import { orderService } from '../services/orderService';

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
  const [tableKitchenComments, setTableKitchenComments] = useState({}); // Comentarios de comandas: { tableNumber: { timestamp: comment } }
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        setIsLoading(true);
        const [orders, history, discounts, timestamps, completed, comments] = await Promise.all([
          storageService.loadTableOrders(),
          storageService.loadTableHistory(),
          storageService.loadTableDiscounts(),
          storageService.loadKitchenTimestamps(),
          storageService.loadCompletedKitchenOrders(),
          storageService.loadKitchenComments()
        ]);

        if (orders) setTableOrders(orders);
        if (history) setTableHistory(history);
        if (discounts) setTableDiscounts(discounts);
        if (timestamps) setTableKitchenTimestamps(timestamps);
        if (completed) setCompletedKitchenOrders(completed);
        if (comments) setTableKitchenComments(comments);
      } catch (error) {
        console.error('[TableOrdersContext] Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedData();
  }, []);

  // Guardar datos cuando cambien (con debounce)
  useEffect(() => {
    if (isLoading) return;
    
    const saveData = async () => {
      await Promise.all([
        storageService.saveTableOrders(tableOrders),
        storageService.saveTableHistory(tableHistory),
        storageService.saveTableDiscounts(tableDiscounts),
        storageService.saveKitchenTimestamps(tableKitchenTimestamps),
        storageService.saveCompletedKitchenOrders(completedKitchenOrders),
        storageService.saveKitchenComments(tableKitchenComments)
      ]);
    };

    const timeoutId = setTimeout(saveData, 1000); // Debounce de 1 segundo
    return () => clearTimeout(timeoutId);
  }, [tableOrders, tableHistory, tableDiscounts, tableKitchenTimestamps, completedKitchenOrders, tableKitchenComments, isLoading]);

  /**
   * Agrega un item al pedido de una mesa
   */
  const addItemToTable = (tableNumber, item, selectedExtras = {}, selectedDrink = null) => {
    if (!orderService.isValidTableNumber(tableNumber)) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }

    const table = orderService.normalizeTableNumber(tableNumber);
    if (!table) {
      alert('Número de mesa inválido');
      return;
    }

    const extras = selectedExtras[item.id] || [];
    const drink = selectedDrink || null;
    const price = orderService.calculateItemPrice(item, selectedExtras);

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
    const table = orderService.normalizeTableNumber(tableNumber);
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
    const table = orderService.normalizeTableNumber(tableNumber);
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
    return orderService.calculateSubtotal(orders);
  };

  /**
   * Verifica si una mesa está ocupada
   */
  const isTableOccupied = (tableNumber) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    const orders = getTableOrdersFromState(tableOrders, table);
    return orderService.hasActiveOrders(orders);
  };

  /**
   * Limpia todos los pedidos de una mesa
   */
  const clearTable = (tableNumber) => {
    const table = orderService.normalizeTableNumber(tableNumber);
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
    const from = orderService.normalizeTableNumber(fromTable);
    const to = orderService.normalizeTableNumber(toTable);
    
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
    const table = orderService.normalizeTableNumber(tableNumber);
    setTableDiscounts(prev => ({
      ...prev,
      [table]: discount
    }));
  };

  /**
   * Obtiene el descuento de una mesa
   */
  const getTableDiscount = (tableNumber) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    return tableDiscounts[table] || 0;
  };

  /**
   * Calcula el total con descuento
   */
  const getTableTotalWithDiscount = (tableNumber) => {
    const total = getTableTotal(tableNumber);
    const discount = getTableDiscount(tableNumber);
    return orderService.calculateTotalWithDiscount(total, discount);
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

    const subtotal = orderService.calculateSubtotal(itemsToPay);
    
    let discountAmount = 0;
    if (orderIds === null) {
      discountAmount = discount;
    } else if (tableTotal > 0) {
      discountAmount = orderService.calculateProportionalDiscount(tableTotal, discount, subtotal);
    }
    
    const totalPaid = orderService.calculateTotalWithDiscount(subtotal, discountAmount);

    const paymentRecord = orderService.createPaymentRecord(
      tableNumber,
      itemsToPay,
      subtotal,
      discountAmount,
      totalPaid
    );

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
    return orderService.calculateHistoryTotal(history);
  };

  /**
   * Establece el timestamp de cuando se envió una comanda a cocina
   * Agrega un nuevo timestamp al array en lugar de reemplazar el anterior.
   * Esto permite mantener múltiples timers por mesa (uno por cada envío).
   * @returns {number} El timestamp creado
   */
  const setKitchenTimestamp = (tableNumber) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    const timestamp = Date.now();
    setTableKitchenTimestamps(prev => {
      const existingTimestamps = prev[table] || [];
      return {
        ...prev,
        [table]: [...existingTimestamps, timestamp] // Agrega nuevo timestamp sin eliminar los anteriores
      };
    });
    return timestamp; // Retornar el timestamp para asociarlo con comentarios
  };

  /**
   * Obtiene el timestamp más reciente de cuando se envió una comanda a cocina
   * Retorna el último timestamp del array (el más reciente)
   */
  const getKitchenTimestamp = (tableNumber) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    const timestamps = tableKitchenTimestamps[table] || tableKitchenTimestamps[String(table)] || [];
    // Retorna el timestamp más reciente (último del array)
    return timestamps.length > 0 ? timestamps[timestamps.length - 1] : null;
  };

  /**
   * Obtiene todos los timestamps de una mesa (para mostrar múltiples timers si es necesario)
   */
  const getAllKitchenTimestamps = (tableNumber) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    return tableKitchenTimestamps[table] || tableKitchenTimestamps[String(table)] || [];
  };

  /**
   * Marca una comanda como completada (para el rol de cocina)
   * @param {number} tableNumber - Número de mesa
   * @param {number} timestamp - Timestamp de la comanda a marcar como completada
   */
  const markKitchenOrderCompleted = (tableNumber, timestamp) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    
    setCompletedKitchenOrders(prev => {
      const tableCompleted = prev[table] || prev[String(table)] || {};
      
      return {
        ...prev,
        [table]: {
          ...tableCompleted,
          [timestamp]: true,
          [String(timestamp)]: true
        },
        [String(table)]: {
          ...(prev[String(table)] || {}),
          [timestamp]: true,
          [String(timestamp)]: true
        }
      };
    });
  };

  /**
   * Verifica si una comanda está marcada como completada
   * @param {number} tableNumber - Número de mesa
   * @param {number} timestamp - Timestamp de la comanda
   * @returns {boolean} - true si está completada, false si no
   */
  const isKitchenOrderCompleted = (tableNumber, timestamp) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    const tableCompletedNum = completedKitchenOrders[table] || {};
    const tableCompletedStr = completedKitchenOrders[String(table)] || {};
    const tableCompleted = { ...tableCompletedNum, ...tableCompletedStr };
    
    return tableCompleted[timestamp] === true || 
           tableCompleted[String(timestamp)] === true ||
           tableCompletedNum[timestamp] === true ||
           tableCompletedNum[String(timestamp)] === true ||
           tableCompletedStr[timestamp] === true ||
           tableCompletedStr[String(timestamp)] === true;
  };

  /**
   * Obtiene todas las comandas completadas de una mesa
   */
  const getCompletedKitchenOrders = (tableNumber) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    return completedKitchenOrders[table] || completedKitchenOrders[String(table)] || {};
  };

  /**
   * Establece un comentario para una comanda específica (por mesa y timestamp)
   * @param {number} tableNumber - Número de mesa
   * @param {number} timestamp - Timestamp de la comanda
   * @param {string} comment - Comentario a agregar
   */
  const setKitchenComment = (tableNumber, timestamp, comment) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    setTableKitchenComments(prev => {
      const tableComments = prev[table] || prev[String(table)] || {};
      return {
        ...prev,
        [table]: {
          ...tableComments,
          [timestamp]: comment,
          [String(timestamp)]: comment
        },
        [String(table)]: {
          ...(prev[String(table)] || {}),
          [timestamp]: comment,
          [String(timestamp)]: comment
        }
      };
    });
  };

  /**
   * Obtiene el comentario de una comanda específica
   * @param {number} tableNumber - Número de mesa
   * @param {number} timestamp - Timestamp de la comanda
   * @returns {string|null} - Comentario o null si no existe
   */
  const getKitchenComment = (tableNumber, timestamp) => {
    const table = orderService.normalizeTableNumber(tableNumber);
    const tableCommentsNum = tableKitchenComments[table] || {};
    const tableCommentsStr = tableKitchenComments[String(table)] || {};
    const tableComments = { ...tableCommentsNum, ...tableCommentsStr };
    
    return tableComments[timestamp] || tableComments[String(timestamp)] || null;
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
        completedKitchenOrders,
        setKitchenComment,
        getKitchenComment,
        tableKitchenComments
      }}
    >
      {children}
    </TableOrdersContext.Provider>
  );
};

