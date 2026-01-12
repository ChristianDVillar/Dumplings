import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import { filterKitchenOrders } from '../utils/printHelpers';
import { getElapsedTimeWithColor } from '../utils/timeHelpers';
import ComandaTicket from './ComandaTicket';
import { useTranslations } from '../utils/translations';

const KitchenView = () => {
  const { tableOrders, getTableOrders, isTableOccupied, getKitchenTimestamp, getAllKitchenTimestamps, tableKitchenTimestamps } = useTableOrdersContext();
  const { lastUpdate, language } = useAppContext();
  const t = useTranslations(language);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.takeaway];

  // Obtener todas las mesas con pedidos y sus timestamps
  const occupiedTables = useMemo(() => {
    const occupied = allTables.filter(table => {
      const isOccupied = isTableOccupied(table);
      return isOccupied;
    });
    
    // Agregar información de tiempo para cada mesa
    return occupied.map(table => {
      const allTimestamps = getAllKitchenTimestamps(table);
      // Mostrar el timer más reciente en la tarjeta de mesa
      const latestTimestamp = allTimestamps.length > 0 ? allTimestamps[allTimestamps.length - 1] : null;
      const elapsedTime = latestTimestamp ? getElapsedTimeWithColor(latestTimestamp) : null;
      return {
        number: table,
        timestamp: latestTimestamp,
        allTimestamps, // Guardar todos los timestamps para uso futuro
        elapsedTime,
        timerCount: allTimestamps.length // Número de timers activos
      };
    });
  }, [allTables, tableOrders, lastUpdate, isTableOccupied, getKitchenTimestamp, getAllKitchenTimestamps, currentTime, tableKitchenTimestamps]);

  // Obtener pedidos de la mesa seleccionada - SOLO items de cocina (filtrados)
  const tableOrdersList = useMemo(() => {
    if (!selectedTable) {
      return [];
    }
    const allOrders = getTableOrders(selectedTable);
    // Filtrar solo los items que van a cocina
    const kitchenOrders = filterKitchenOrders(allOrders);
    return kitchenOrders;
  }, [selectedTable, tableOrders, lastUpdate, getTableOrders]);

  // Actualizar el tiempo cada segundo para mostrar el tiempo transcurrido
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Obtener todos los timers para la mesa seleccionada
  const allElapsedTimes = useMemo(() => {
    if (!selectedTable) return [];
    const allTimestamps = getAllKitchenTimestamps(selectedTable);
    return allTimestamps.map(timestamp => ({
      timestamp,
      elapsed: getElapsedTimeWithColor(timestamp)
    }));
  }, [selectedTable, getAllKitchenTimestamps, currentTime, tableKitchenTimestamps]);

  // Obtener el tiempo transcurrido más reciente para la mesa seleccionada (para mostrar en el header)
  const latestElapsedTime = useMemo(() => {
    if (!selectedTable) return null;
    const timestamp = getKitchenTimestamp(selectedTable);
    if (timestamp) {
      return getElapsedTimeWithColor(timestamp);
    }
    return { text: t.kitchen.notSent, color: '#F44336' };
  }, [selectedTable, getKitchenTimestamp, currentTime, tableKitchenTimestamps]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.kitchen.title}</Text>
      
      {/* Lista de mesas ocupadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t.kitchen.tablesWithOrders(occupiedTables.length)}
        </Text>
        {occupiedTables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t.kitchen.noTables}</Text>
            <Text style={styles.emptySubtext}>
              {t.kitchen.noTablesSubtext}
            </Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tablesScroll}
          >
            {occupiedTables.map((tableData) => (
              <TouchableOpacity
                key={tableData.number}
                style={[
                  styles.tableCard,
                  selectedTable === tableData.number && styles.tableCardSelected
                ]}
                onPress={() => setSelectedTable(tableData.number)}
              >
                <Text style={[
                  styles.tableNumber,
                  selectedTable === tableData.number && styles.tableNumberSelected
                ]}>
                  {tableData.number}
                </Text>
                <View style={styles.occupiedDot} />
                {/* Timer en la tarjeta de mesa - siempre visible */}
                <View style={styles.tableTimer}>
                  <Text style={styles.tableTimerText}>
                    {tableData.elapsedTime ? tableData.elapsedTime.text : t.kitchen.notSent}
                  </Text>
                  {tableData.timerCount > 1 && (
                    <Text style={styles.tableTimerCount}>
                      +{tableData.timerCount - 1}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Comanda de la mesa seleccionada */}
      {selectedTable && tableOrdersList.length > 0 && (
        <View style={styles.ticketSection}>
          <View style={styles.comandaHeader}>
            <View style={styles.comandaHeaderLeft}>
              <Text style={styles.comandaTitle}>{t.kitchen.table} {selectedTable}</Text>
            </View>
            {/* Timer al costado de la comanda - siempre visible */}
            <View style={styles.comandaTimer}>
              <Text style={styles.comandaTimerLabel}>{t.kitchen.time}:</Text>
              <Text style={[styles.comandaTimerValue, latestElapsedTime && { color: latestElapsedTime.color }]}>
                {latestElapsedTime ? latestElapsedTime.text : t.kitchen.notSent}
              </Text>
              {allElapsedTimes.length > 1 && (
                <Text style={styles.comandaTimerCount}>
                  ({allElapsedTimes.length} envíos)
                </Text>
              )}
            </View>
          </View>
          <ScrollView style={styles.ticketContainer}>
            <ComandaTicket
              tableNumber={selectedTable}
              orders={tableOrdersList}
              type="kitchen"
              date={new Date().toISOString()}
              showPrices={false}
            />
          </ScrollView>
        </View>
      )}

      {selectedTable && tableOrdersList.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t.kitchen.noTables}
          </Text>
          <Text style={styles.emptySubtext}>
            ({t.kitchen.items})
          </Text>
        </View>
      )}

      {!selectedTable && occupiedTables.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.kitchen.noTables}</Text>
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
    width: 100,
    minHeight: 100,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    position: 'relative',
    paddingTop: 8,
    paddingBottom: 8,
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
  occupiedDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  tableTimer: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F44336',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tableTimerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tableTimerCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 2,
  },
  ordersSection: {
    flex: 1,
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
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  printButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  printButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ordersScroll: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
  },
  orderItem: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
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
  orderItemNumber: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  orderExtras: {
    fontSize: 12,
    color: '#FFA500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  orderDrink: {
    fontSize: 12,
    color: '#90CAF9',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  ticketSection: {
    flex: 1,
  },
  comandaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  comandaHeaderLeft: {
    flex: 1,
  },
  comandaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  comandaTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  comandaTimerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  comandaTimerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comandaTimerCount: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#FFD700',
    marginLeft: 8,
  },
  ticketContainer: {
    flex: 1,
  },
});

export default KitchenView;

