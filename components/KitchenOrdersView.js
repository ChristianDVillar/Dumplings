import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions, Alert } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import { filterKitchenOrders } from '../utils/printHelpers';
import { getElapsedTimeWithColor } from '../utils/timeHelpers';
import { statisticsService } from '../services/statisticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const KitchenOrdersView = () => {
  const { 
    tableOrders, 
    getTableOrders, 
    isTableOccupied, 
    getAllKitchenTimestamps,
    toggleKitchenItemReady,
    isKitchenOrderCompleted,
    tableKitchenTimestamps,
    completedKitchenOrders,
    isLoading
  } = useTableOrdersContext();
  
  // Mostrar carga mientras se inicializa el contexto
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cargando...</Text>
      </View>
    );
  }
  
  const { lastUpdate } = useAppContext();
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

  // Obtener todos los items de cocina de todas las mesas
  const allKitchenItems = useMemo(() => {
    const items = [];
    
    allTables.forEach(table => {
      if (!isTableOccupied(table)) return;
      
      const allOrders = getTableOrders(table);
      const kitchenOrders = filterKitchenOrders(allOrders);
      
      if (kitchenOrders.length === 0) return;
      
      const allTimestamps = getAllKitchenTimestamps(table);
      const latestTimestamp = allTimestamps.length > 0 ? allTimestamps[allTimestamps.length - 1] : null;
      
      // Agregar todos los items de cocina de esta mesa
      kitchenOrders.forEach(order => {
        // Usar kitchenSentAt del item si existe, sino el timestamp más reciente de la mesa
        const itemTimestamp = order.kitchenSentAt || latestTimestamp;
        // Usar el timestamp más reciente como timestamp de comanda para agrupar
        const comandaTimestamp = latestTimestamp || order.kitchenSentAt;
        
        // Verificar si la comanda está completada
        const isComandaCompleted = latestTimestamp ? isKitchenOrderCompleted(table, latestTimestamp) : false;
        
        items.push({
          tableNumber: table,
          comandaTimestamp: comandaTimestamp,
          order: order,
          itemTimestamp: itemTimestamp,
          isComandaCompleted: isComandaCompleted
        });
      });
    });
    
    // Ordenar por timestamp (más antiguos primero)
    return items.sort((a, b) => {
      const timestampA = a.comandaTimestamp || a.itemTimestamp || 0;
      const timestampB = b.comandaTimestamp || b.itemTimestamp || 0;
      return timestampA - timestampB;
    });
  }, [allTables, tableOrders, lastUpdate, isTableOccupied, getTableOrders, getAllKitchenTimestamps, isKitchenOrderCompleted, currentTime, tableKitchenTimestamps, completedKitchenOrders]);

  // Filtrar items según el toggle y excluir items marcados como listos
  const displayedItems = useMemo(() => {
    // Primero filtrar items que están marcados como listos (siempre excluirlos)
    const itemsNotReady = allKitchenItems.filter(item => !item.order.kitchenReady);
    
    if (showCompleted) {
      return itemsNotReady; // Mostrar todas las pendientes (sin los listos)
    } else {
      return itemsNotReady.filter(item => !item.isComandaCompleted); // Solo pendientes no completadas
    }
  }, [allKitchenItems, showCompleted]);

  // Calcular estadísticas por categoría (solo items no listos)
  const categoryStats = useMemo(() => {
    const stats = {};
    
    // Solo contar items que no están marcados como listos
    allKitchenItems
      .filter(item => !item.order.kitchenReady)
      .forEach(item => {
        const category = item.order.item.category || 'OTROS';
        if (!stats[category]) {
          stats[category] = { name: category, total: 0 };
        }
        stats[category].total += item.order.quantity;
      });
    
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [allKitchenItems]);

  // Formatear timestamp de comanda
  const formatComandaTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
      
      {displayedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay comandas pendientes</Text>
          <Text style={styles.emptySubtext}>
            Todas las comandas están completadas o no hay pedidos
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {/* Encabezado de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.headerCellMesa]}>Mesa</Text>
            <Text style={[styles.headerCell, styles.headerCellComanda]}>Comanda</Text>
            <Text style={[styles.headerCell, styles.headerCellProducto]}>Producto</Text>
            <Text style={[styles.headerCell, styles.headerCellCantidad]}>Cant.</Text>
            <Text style={[styles.headerCell, styles.headerCellTiempo]}>Tiempo</Text>
            <Text style={[styles.headerCell, styles.headerCellCheck]}>Listo</Text>
          </View>

          {/* Filas de la tabla */}
          <ScrollView style={styles.tableBody}>
            {displayedItems.map((item, index) => {
              const { tableNumber, comandaTimestamp, order, itemTimestamp, isComandaCompleted } = item;
              // Calcular tiempo transcurrido hasta que se marcó como listo (si está listo) o hasta ahora
              const finalTimestamp = order.kitchenReadyAt || itemTimestamp;
              const elapsed = finalTimestamp 
                ? getElapsedTimeWithColor(finalTimestamp)
                : { text: 'N/A', color: '#999' };
              
              // Construir nombre del producto con extras y bebida
              let productName = order.item.nameEs;
              if (order.item.number) {
                productName += ` #${order.item.number}`;
              }
              const extras = [];
              if (order.extras && order.extras.length > 0) {
                extras.push(`+ ${order.extras.join(', ')}`);
              }
              if (order.drink) {
                extras.push(`Bebida: ${order.drink}`);
              }
              
              return (
                <View
                  key={`${tableNumber}-${order.orderId}-${index}`}
                  style={[
                    styles.tableRow,
                    isComandaCompleted && styles.tableRowCompleted
                  ]}
                >
                  <Text style={[styles.tableCell, styles.cellMesa]}>{tableNumber}</Text>
                  <Text style={[styles.tableCell, styles.cellComanda]}>
                    {formatComandaTime(comandaTimestamp)}
                  </Text>
                  <View style={[styles.tableCell, styles.cellProducto]}>
                    <Text style={styles.productName}>{productName}</Text>
                    {extras.length > 0 && (
                      <Text style={styles.productExtras}>{extras.join(' • ')}</Text>
                    )}
                  </View>
                  <Text style={[styles.tableCell, styles.cellCantidad]}>{order.quantity}</Text>
                  <View style={[styles.tableCell, styles.cellTiempo]}>
                    <View style={[styles.timerBadge, { backgroundColor: elapsed.color }]}>
                      <Text style={styles.timerText}>{elapsed.text}</Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, styles.cellCheck]}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => {
                        if (toggleKitchenItemReady && typeof toggleKitchenItemReady === 'function') {
                          toggleKitchenItemReady(tableNumber, order.orderId);
                        } else {
                          console.error('toggleKitchenItemReady no disponible:', {
                            exists: !!toggleKitchenItemReady,
                            type: typeof toggleKitchenItemReady,
                            tableNumber,
                            orderId: order.orderId
                          });
                        }
                      }}
                    >
                      {/* Checkbox vacío - al presionarlo marca como listo y desaparece */}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
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
  tableContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
  },
  headerCell: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerCellMesa: {
    width: 60,
  },
  headerCellComanda: {
    width: 80,
  },
  headerCellProducto: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 8,
  },
  headerCellCantidad: {
    width: 50,
  },
  headerCellTiempo: {
    width: 80,
  },
  headerCellCheck: {
    width: 60,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: isMobile ? 50 : 60,
  },
  tableRowReady: {
    backgroundColor: '#1A3A1A',
    opacity: 0.8,
  },
  tableRowCompleted: {
    backgroundColor: '#1A2A1A',
    opacity: 0.6,
  },
  tableCell: {
    fontSize: isMobile ? 12 : 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cellMesa: {
    width: 60,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cellComanda: {
    width: 80,
    fontSize: isMobile ? 11 : 12,
    color: '#FFA500',
  },
  cellProducto: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  cellCantidad: {
    width: 50,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cellTiempo: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCheck: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: isMobile ? 12 : 13,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  productExtras: {
    fontSize: isMobile ? 10 : 11,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  timerBadge: {
    paddingHorizontal: isMobile ? 6 : 8,
    paddingVertical: isMobile ? 3 : 4,
    borderRadius: 6,
    minWidth: isMobile ? 50 : 60,
    alignItems: 'center',
  },
  timerText: {
    fontSize: isMobile ? 10 : 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  checkbox: {
    width: isMobile ? 28 : 32,
    height: isMobile ? 28 : 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
});

export default KitchenOrdersView;

