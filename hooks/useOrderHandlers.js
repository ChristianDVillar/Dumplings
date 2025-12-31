import { useMemo } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook personalizado para manejar la lógica de pedidos
 * Calcula totales, descuentos y obtiene pedidos actuales
 */
export const useOrderHandlers = (
  selectedTable,
  tableOrders,
  getTableOrders,
  getTableTotal,
  getTableDiscount,
  getTableTotalWithDiscount,
  isTableOccupied,
  getTableHistoryTotal
) => {
  /**
   * Obtiene los pedidos actuales de la mesa seleccionada
   */
  const currentOrders = useMemo(() => {
    if (!selectedTable) {
      return [];
    }
    const orders = getTableOrders(selectedTable);
    logger.debug('[useOrderHandlers] currentOrders:', {
      selectedTable,
      ordersCount: orders.length
    });
    return orders;
  }, [selectedTable, tableOrders, getTableOrders]);

  /**
   * Calcula el total sin descuento
   */
  const currentTotal = useMemo(() => {
    return selectedTable ? getTableTotal(selectedTable) : 0;
  }, [selectedTable, tableOrders, getTableTotal]);

  /**
   * Obtiene el descuento actual
   */
  const currentDiscount = useMemo(() => {
    return selectedTable ? getTableDiscount(selectedTable) : 0;
  }, [selectedTable, getTableDiscount]);

  /**
   * Calcula el total con descuento
   */
  const currentTotalWithDiscount = useMemo(() => {
    return selectedTable ? getTableTotalWithDiscount(selectedTable) : 0;
  }, [selectedTable, tableOrders, getTableTotalWithDiscount]);

  /**
   * Verifica si la mesa está ocupada
   */
  const currentOccupied = useMemo(() => {
    return selectedTable ? isTableOccupied(selectedTable) : false;
  }, [selectedTable, tableOrders, isTableOccupied]);

  /**
   * Obtiene el total histórico
   */
  const historyTotal = useMemo(() => {
    return selectedTable ? getTableHistoryTotal(selectedTable) : 0;
  }, [selectedTable, getTableHistoryTotal]);

  return {
    currentOrders,
    currentTotal,
    currentDiscount,
    currentTotalWithDiscount,
    currentOccupied,
    historyTotal
  };
};

