import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions, Alert } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import { filterKitchenOrders } from '../utils/printHelpers';
import { getElapsedTimeWithColor } from '../utils/timeHelpers';
import ComandaTicket from './ComandaTicket';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const KitchenOrdersView = () => {
  const { 
    tableOrders, 
    getTableOrders, 
    isTableOccupied, 
    getAllKitchenTimestamps,
    markKitchenOrderCompleted,
    isKitchenOrderCompleted,
    getCompletedKitchenOrders,
    tableKitchenTimestamps,
    completedKitchenOrders
  } = useTableOrdersContext();
  const { lastUpdate, setLastUpdate } = useAppContext();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showCompleted, setShowCompleted] = useState(true); // Mostrar todas las comandas por defecto
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.takeaway];

  // Actualizar el tiempo cada segundo para mostrar el tiempo transcurrido
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Obtener todas las comandas (completadas y no completadas) agrupadas por mesa y timestamp
  const allKitchenOrders = useMemo(() => {
    const orders = [];
    
    allTables.forEach(table => {
      if (!isTableOccupied(table)) return;
      
      const allTimestamps = getAllKitchenTimestamps(table);
      
      allTimestamps.forEach(timestamp => {
        const tableOrdersList = getTableOrders(table);
        const kitchenOrders = filterKitchenOrders(tableOrdersList);
        
        if (kitchenOrders.length > 0) {
          const isCompleted = isKitchenOrderCompleted(table, timestamp);
          console.log('🔵 [KitchenOrdersView] Procesando comanda:', {
            table,
            timestamp,
            timestampType: typeof timestamp,
            isCompleted,
            kitchenOrdersCount: kitchenOrders.length
          });
          
          const elapsedTime = getElapsedTimeWithColor(timestamp);
          orders.push({
            tableNumber: table,
            timestamp,
            orders: kitchenOrders,
            elapsedTime,
            isCompleted,
            orderId: `${table}-${timestamp}` // ID único para esta comanda
          });
        }
      });
    });
    
    // Ordenar por timestamp (más antiguos primero)
    return orders.sort((a, b) => a.timestamp - b.timestamp);
  }, [allTables, tableOrders, lastUpdate, isTableOccupied, getAllKitchenTimestamps, isKitchenOrderCompleted, getTableOrders, currentTime, tableKitchenTimestamps, completedKitchenOrders]);

  // Filtrar comandas según el toggle
  const displayedOrders = useMemo(() => {
    if (showCompleted) {
      return allKitchenOrders; // Mostrar todas
    } else {
      return allKitchenOrders.filter(order => !order.isCompleted); // Solo pendientes
    }
  }, [allKitchenOrders, showCompleted]);

  const handleMarkCompleted = (tableNumber, timestamp) => {
    console.log('🔵 [KitchenOrdersView] handleMarkCompleted llamado:', { tableNumber, timestamp, timestampType: typeof timestamp });
    
    // Marcar directamente sin Alert (más confiable en web)
    console.log('🟢 [KitchenOrdersView] Llamando markKitchenOrderCompleted directamente:', { tableNumber, timestamp });
    markKitchenOrderCompleted(tableNumber, timestamp);
    
    // Forzar actualización del contexto para que el componente se re-renderice
    setLastUpdate(Date.now());
    console.log('🟢 [KitchenOrdersView] markKitchenOrderCompleted llamado y lastUpdate actualizado');
  };

  // Calcular estadísticas por categoría
  const categoryStats = useMemo(() => {
    const stats = {};
    
    allKitchenOrders.forEach(orderData => {
      orderData.orders.forEach(order => {
        const category = order.item.category || 'OTROS';
        if (!stats[category]) {
          stats[category] = { name: category, total: 0 };
        }
        stats[category].total += order.quantity;
      });
    });
    
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [allKitchenOrders]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍🍳 Comandas de Cocina</Text>
      
      {/* Toggle para mostrar/ocultar completadas */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showCompleted && styles.toggleButtonActive]}
          onPress={() => setShowCompleted(false)}
        >
          <Text style={[styles.toggleButtonText, !showCompleted && styles.toggleButtonTextActive]}>
            Pendientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showCompleted && styles.toggleButtonActive]}
          onPress={() => setShowCompleted(true)}
        >
          <Text style={[styles.toggleButtonText, showCompleted && styles.toggleButtonTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas por categoría */}
      {categoryStats.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>📊 Estadísticas del Día</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
            {categoryStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statCategory}>{stat.name}</Text>
                <Text style={styles.statTotal}>{stat.total}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {displayedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay comandas pendientes</Text>
          <Text style={styles.emptySubtext}>
            Todas las comandas están completadas o no hay pedidos
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.ordersScroll}>
          {displayedOrders.map((orderData) => {
            return (
              <View key={orderData.orderId} style={[
                styles.orderCard,
                orderData.isCompleted && styles.orderCardCompleted
              ]}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderTableNumber}>
                      Mesa {orderData.tableNumber}
                    </Text>
                    <Text style={styles.orderTime}>
                      {new Date(orderData.timestamp).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.orderHeaderRight}>
                    <View style={[
                      styles.timerBadge,
                      { backgroundColor: orderData.elapsedTime.color }
                    ]}>
                      <Text style={styles.timerText}>
                        {orderData.elapsedTime.text}
                      </Text>
                    </View>
                    {!orderData.isCompleted && (
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleMarkCompleted(orderData.tableNumber, orderData.timestamp)}
                      >
                        <Text style={styles.completeButtonText}>
                          ✓ Lista
                        </Text>
                      </TouchableOpacity>
                    )}
                    {orderData.isCompleted && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>
                          ✓ Completada
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.ticketContainer}>
                  <ComandaTicket
                    tableNumber={orderData.tableNumber}
                    orders={orderData.orders}
                    type="kitchen"
                    date={new Date(orderData.timestamp).toISOString()}
                    showPrices={false}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: isMobile ? 10 : 15,
  },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: isMobile ? 15 : 20,
  },
  ordersScroll: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: isMobile ? 12 : 15,
    padding: isMobile ? 12 : 15,
    borderWidth: 2,
    borderColor: '#FFD700',
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isMobile ? 10 : 15,
    paddingBottom: isMobile ? 10 : 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderTableNumber: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: isMobile ? 12 : 14,
    color: '#FFA500',
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerBadge: {
    paddingHorizontal: isMobile ? 10 : 12,
    paddingVertical: isMobile ? 6 : 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  timerText: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: isMobile ? 14 : 16,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
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
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 13 : 14,
    fontWeight: 'bold',
  },
  ticketContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: isMobile ? 8 : 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: isMobile ? 18 : 20,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: isMobile ? 14 : 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 4,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  toggleButton: {
    flex: 1,
    padding: isMobile ? 10 : 12,
    borderRadius: 6,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFD700',
  },
  toggleButtonText: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  toggleButtonTextActive: {
    color: '#1A1A1A',
  },
  statsContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: isMobile ? 12 : 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  statsTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  statsScroll: {
    maxHeight: 100,
  },
  statCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: isMobile ? 10 : 12,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  statCategory: {
    fontSize: isMobile ? 11 : 12,
    color: '#FFA500',
    marginBottom: 5,
    textAlign: 'center',
  },
  statTotal: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  orderCardCompleted: {
    opacity: 0.7,
    borderColor: '#4CAF50',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: isMobile ? 14 : 16,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 13 : 14,
    fontWeight: 'bold',
  },
});

export default KitchenOrdersView;

