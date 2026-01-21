import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import { filterKitchenOrders } from '../utils/printHelpers';
import { getElapsedTimeWithColor } from '../utils/timeHelpers';
import { useTranslations } from '../utils/translations';

const KitchenView = () => {
  const { 
    tableOrders, 
    getTableOrders, 
    isTableOccupied, 
    getAllKitchenTimestamps, 
    tableKitchenTimestamps,
    toggleKitchenItemReady
  } = useTableOrdersContext();
  const { lastUpdate, language } = useAppContext();
  const t = useTranslations(language);
  const [currentTime, setCurrentTime] = useState(Date.now());
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
        
        items.push({
          tableNumber: table,
          comandaTimestamp: comandaTimestamp,
          order: order,
          itemTimestamp: itemTimestamp
        });
      });
    });
    
    // Ordenar por timestamp (más antiguos primero)
    return items.sort((a, b) => {
      const timestampA = a.comandaTimestamp || a.itemTimestamp || 0;
      const timestampB = b.comandaTimestamp || b.itemTimestamp || 0;
      return timestampA - timestampB;
    });
  }, [allTables, tableOrders, lastUpdate, isTableOccupied, getTableOrders, getAllKitchenTimestamps, currentTime, tableKitchenTimestamps]);

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
      <Text style={styles.title}>{t.kitchen.title}</Text>
      
      {allKitchenItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.kitchen.noTables}</Text>
          <Text style={styles.emptySubtext}>
            {t.kitchen.noTablesSubtext}
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
            {allKitchenItems.map((item, index) => {
              const { tableNumber, comandaTimestamp, order, itemTimestamp } = item;
              const elapsed = itemTimestamp 
                ? getElapsedTimeWithColor(itemTimestamp)
                : { text: t.kitchen.notSent, color: '#999' };
              const isReady = order.kitchenReady === true;
              
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
                    isReady && styles.tableRowReady
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
                      style={[
                        styles.checkbox,
                        isReady && styles.checkboxChecked
                      ]}
                      onPress={() => toggleKitchenItemReady(tableNumber, order.orderId)}
                    >
                      {isReady && <Text style={styles.checkmark}>✓</Text>}
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
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
  },
  headerCell: {
    fontSize: 14,
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 60,
  },
  tableRowReady: {
    backgroundColor: '#1A3A1A',
    opacity: 0.8,
  },
  tableCell: {
    fontSize: 13,
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
    fontSize: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 2,
  },
  productExtras: {
    fontSize: 11,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  timerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  checkbox: {
    width: 32,
    height: 32,
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
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default KitchenView;

