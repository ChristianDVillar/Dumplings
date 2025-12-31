import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import ClientTicket from './ClientTicket';

const ClientView = () => {
  const { getTableOrders, getTableTotal, getTableDiscount, getTableTotalWithDiscount, isTableOccupied, getTableHistory, tableOrders } = useTableOrdersContext();
  const [selectedTable, setSelectedTable] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.takeaway];

  // Obtener todas las mesas con pedidos activos o historial
  const occupiedTables = useMemo(() => {
    return allTables.filter(table => {
      const hasActiveOrders = isTableOccupied(table);
      const history = getTableHistory(table);
      return hasActiveOrders || (history && history.length > 0);
    });
  }, [allTables, tableOrders, isTableOccupied, getTableHistory]);

  // Obtener pedidos activos de la mesa
  const activeOrders = useMemo(() => {
    if (!selectedTable) return [];
    const orders = getTableOrders(selectedTable);
    console.log('🔍 [ClientView] activeOrders:', {
      selectedTable,
      ordersCount: orders.length,
      orders: orders.map(o => ({ id: o.item.id, name: o.item.nameEs, quantity: o.quantity }))
    });
    return orders;
  }, [selectedTable, tableOrders, getTableOrders]);

  // Obtener historial de pagos de la mesa
  const history = useMemo(() => {
    if (!selectedTable) return [];
    const hist = getTableHistory(selectedTable) || [];
    console.log('🔍 [ClientView] history:', {
      selectedTable,
      historyCount: hist.length,
      lastPayment: hist.length > 0 ? hist[hist.length - 1] : null
    });
    return hist;
  }, [selectedTable, tableOrders, getTableHistory]);

  // Calcular totales de pedidos activos
  const subtotal = selectedTable ? getTableTotal(selectedTable) : 0;
  const discount = selectedTable ? getTableDiscount(selectedTable) : 0;
  const total = selectedTable ? getTableTotalWithDiscount(selectedTable) : 0;

  // Estado para la comanda seleccionada del historial
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  
  // Obtener la comanda seleccionada del historial (o la última si no hay selección)
  const selectedPayment = useMemo(() => {
    if (selectedPaymentId) {
      return history.find(p => p.id === selectedPaymentId) || null;
    }
    // Si no hay selección, mostrar la última comanda pagada
    return history.length > 0 ? history[history.length - 1] : null;
  }, [history, selectedPaymentId]);
  
  // Calcular totales de la comanda seleccionada
  const historySubtotal = selectedPayment ? selectedPayment.subtotal : 0;
  const historyDiscount = selectedPayment ? selectedPayment.discount : 0;
  const historyTotal = selectedPayment ? selectedPayment.total : 0;
  const historyOrders = selectedPayment ? selectedPayment.items : [];


  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Vista del Cliente</Text>
      
      {/* Lista de mesas con pedidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Mesas con Pedidos {occupiedTables.length > 0 ? `(${occupiedTables.length})` : ''}
        </Text>
        {occupiedTables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mesas con pedidos</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tablesScroll}
          >
            {occupiedTables.map((table) => {
              const hasActiveOrders = isTableOccupied(table);
              const history = getTableHistory(table);
              const hasHistory = history && history.length > 0;
              
              return (
                <TouchableOpacity
                  key={table}
                  style={[
                    styles.tableCard,
                    selectedTable === table && styles.tableCardSelected
                  ]}
                  onPress={() => {
                    setSelectedTable(table);
                    setShowHistory(false);
                    setSelectedPaymentId(null);
                  }}
                >
                  <Text style={[
                    styles.tableNumber,
                    selectedTable === table && styles.tableNumberSelected
                  ]}>
                    {table}
                  </Text>
                  {hasActiveOrders && (
                    <View style={styles.activeDot} />
                  )}
                  {hasHistory && (
                    <View style={styles.historyBadge}>
                      <Text style={styles.historyBadgeText}>{history.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Selector de vista: Pedidos activos o Historial */}
      {selectedTable && (activeOrders.length > 0 || history.length > 0) && (
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[styles.viewButton, !showHistory && styles.viewButtonActive]}
            onPress={() => {
              setShowHistory(false);
              setSelectedPaymentId(null);
            }}
          >
            <Text style={[styles.viewButtonText, !showHistory && styles.viewButtonTextActive]}>
              Pedido Actual
            </Text>
          </TouchableOpacity>
          {history.length > 0 && (
            <TouchableOpacity
              style={[styles.viewButton, showHistory && styles.viewButtonActive]}
              onPress={() => {
                setShowHistory(true);
                // Seleccionar la última comanda por defecto
                if (history.length > 0 && !selectedPaymentId) {
                  setSelectedPaymentId(history[history.length - 1].id);
                }
              }}
            >
              <Text style={[styles.viewButtonText, showHistory && styles.viewButtonTextActive]}>
                Comandas Pagadas ({history.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Lista de comandas pagadas */}
      {selectedTable && showHistory && history.length > 0 && (
        <View style={styles.historyListContainer}>
          <Text style={styles.historyListTitle}>Selecciona una comanda:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.historyScroll}
          >
            {history.map((payment, index) => {
              const paymentDate = new Date(payment.timestamp);
              const dateStr = paymentDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              const timeStr = paymentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              const isSelected = selectedPaymentId === payment.id || (!selectedPaymentId && index === history.length - 1);
              
              return (
                <TouchableOpacity
                  key={payment.id}
                  style={[
                    styles.historyCard,
                    isSelected && styles.historyCardSelected
                  ]}
                  onPress={() => setSelectedPaymentId(payment.id)}
                >
                  <Text style={[
                    styles.historyCardNumber,
                    isSelected && styles.historyCardNumberSelected
                  ]}>
                    #{history.length - index}
                  </Text>
                  <Text style={[
                    styles.historyCardDate,
                    isSelected && styles.historyCardDateSelected
                  ]}>
                    {dateStr}
                  </Text>
                  <Text style={[
                    styles.historyCardTime,
                    isSelected && styles.historyCardTimeSelected
                  ]}>
                    {timeStr}
                  </Text>
                  <Text style={[
                    styles.historyCardTotal,
                    isSelected && styles.historyCardTotalSelected
                  ]}>
                    {payment.total.toFixed(2)}€
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Ticket del pedido actual */}
      {selectedTable && !showHistory && activeOrders.length > 0 && (
        <ScrollView style={styles.ticketContainer}>
          <ClientTicket
            tableNumber={selectedTable}
            orders={activeOrders}
            subtotal={subtotal}
            discount={discount}
            total={total}
            date={new Date().toISOString()}
          />
        </ScrollView>
      )}

      {/* Ticket de la comanda seleccionada */}
      {selectedTable && showHistory && selectedPayment && (
        <ScrollView style={styles.ticketContainer}>
          <ClientTicket
            tableNumber={selectedTable}
            orders={historyOrders}
            subtotal={historySubtotal}
            discount={historyDiscount}
            total={historyTotal}
            date={selectedPayment.timestamp}
          />
        </ScrollView>
      )}

      {selectedTable && showHistory && !selectedPayment && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay comandas pagadas</Text>
        </View>
      )}

      {selectedTable && activeOrders.length === 0 && history.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay pedidos en esta mesa</Text>
        </View>
      )}

      {!selectedTable && occupiedTables.length > 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Selecciona una mesa para ver su pedido</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  tablesScroll: {
    maxHeight: 100,
  },
  tableCard: {
    width: 80,
    height: 80,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    position: 'relative',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  tableCardSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  tableNumberSelected: {
    color: '#1A1A1A',
  },
  activeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  historyBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFA500',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  historyBadgeText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  viewButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  viewButtonActive: {
    backgroundColor: '#FFD700',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  viewButtonTextActive: {
    color: '#1A1A1A',
  },
  historyListContainer: {
    marginBottom: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  historyListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  historyScroll: {
    maxHeight: 120,
  },
  historyCard: {
    width: 100,
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  historyCardSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  historyCardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  historyCardNumberSelected: {
    color: '#1A1A1A',
  },
  historyCardDate: {
    fontSize: 12,
    color: '#FFA500',
    marginBottom: 2,
  },
  historyCardDateSelected: {
    color: '#1A1A1A',
  },
  historyCardTime: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  historyCardTimeSelected: {
    color: '#666',
  },
  historyCardTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  historyCardTotalSelected: {
    color: '#1A1A1A',
  },
  ticketContainer: {
    flex: 1,
  },
  tableHeader: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  tableTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemsSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFA500',
    paddingBottom: 5,
  },
  orderItem: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    flex: 1,
  },
  orderItemNameEn: {
    fontSize: 12,
    color: '#FFA500',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  extrasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    alignItems: 'center',
  },
  extrasLabel: {
    fontSize: 12,
    color: '#FFA500',
    marginRight: 8,
    fontWeight: '600',
  },
  extraTag: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  extraText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '600',
  },
  drinkContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#2A3A2A',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  drinkLabel: {
    fontSize: 11,
    color: '#FFA500',
    marginBottom: 4,
    fontWeight: '600',
  },
  drinkText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  summarySection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    paddingBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#FFD700',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  discountValue: {
    color: '#F44336',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
  },
});

export default ClientView;

