import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import { generatePrintData, formatPrintText, filterSaladsAndDrinks } from '../utils/printHelpers';
import ComandaTicket from './ComandaTicket';

const WaiterOrdersView = () => {
  const { tableOrders, getTableOrders, isTableOccupied } = useTableOrdersContext();
  const [selectedTable, setSelectedTable] = useState(null);
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.takeaway];

  // Obtener todas las mesas con pedidos
  const occupiedTables = useMemo(() => {
    return allTables.filter(table => isTableOccupied(table));
  }, [allTables, tableOrders, isTableOccupied]);

  // Obtener pedidos de la mesa seleccionada - TODOS los items (comanda completa)
  const tableOrdersList = useMemo(() => {
    if (!selectedTable) return [];
    const allOrders = getTableOrders(selectedTable);
    console.log('🔍 [WaiterOrdersView] tableOrdersList:', {
      selectedTable,
      allOrdersCount: allOrders.length,
      orders: allOrders.map(o => ({ id: o.item.id, name: o.item.nameEs, quantity: o.quantity }))
    });
    // Mostrar TODOS los items (comanda completa para camarero)
    return allOrders;
  }, [selectedTable, tableOrders, getTableOrders]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Comandas de Camarero</Text>
      
      {/* Lista de mesas ocupadas */}
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
            {occupiedTables.map((table) => (
              <TouchableOpacity
                key={table}
                style={[
                  styles.tableCard,
                  selectedTable === table && styles.tableCardSelected
                ]}
                onPress={() => setSelectedTable(table)}
              >
                <Text style={[
                  styles.tableNumber,
                  selectedTable === table && styles.tableNumberSelected
                ]}>
                  {table}
                </Text>
                <View style={styles.occupiedDot} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Comanda de la mesa seleccionada */}
      {selectedTable && tableOrdersList.length > 0 && (
        <ScrollView style={styles.ticketContainer}>
          <ComandaTicket
            tableNumber={selectedTable}
            orders={tableOrdersList}
            type="all"
            date={new Date().toISOString()}
            showPrices={true}
          />
        </ScrollView>
      )}

      {selectedTable && tableOrdersList.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay pedidos en esta mesa
          </Text>
        </View>
      )}

      {!selectedTable && occupiedTables.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay mesas con pedidos</Text>
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
  occupiedDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  ticketContainer: {
    flex: 1,
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

export default WaiterOrdersView;

