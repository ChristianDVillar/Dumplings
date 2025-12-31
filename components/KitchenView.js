import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import { filterKitchenOrders } from '../utils/printHelpers';
import ComandaTicket from './ComandaTicket';

const KitchenView = () => {
  const { tableOrders, getTableOrders, isTableOccupied } = useTableOrdersContext();
  const { lastUpdate } = useAppContext();
  const [selectedTable, setSelectedTable] = useState(null);
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.takeaway];

  // Obtener todas las mesas con pedidos
  const occupiedTables = useMemo(() => {
    console.log('🔍 [KitchenView] occupiedTables - Estado:', {
      tableOrders: tableOrders,
      tableOrdersKeys: Object.keys(tableOrders),
      tableOrdersValues: Object.values(tableOrders).map(arr => arr?.length || 0),
      allTablesCount: allTables.length
    });
    
    const occupied = allTables.filter(table => {
      const isOccupied = isTableOccupied(table);
      if (isOccupied) {
        console.log('🔍 [KitchenView] Mesa ocupada encontrada:', table);
      }
      return isOccupied;
    });
    
    console.log('🔍 [KitchenView] occupiedTables - Resultado:', {
      total: allTables.length,
      occupied: occupied.length,
      occupiedTables: occupied,
      lastUpdate
    });
    return occupied;
  }, [allTables, tableOrders, lastUpdate, isTableOccupied]);

  // Obtener pedidos de la mesa seleccionada - SOLO items de cocina (filtrados)
  const tableOrdersList = useMemo(() => {
    if (!selectedTable) {
      console.log('🔍 [KitchenView] tableOrdersList: No hay mesa seleccionada');
      return [];
    }
    const allOrders = getTableOrders(selectedTable);
    // Filtrar solo los items que van a cocina
    const kitchenOrders = filterKitchenOrders(allOrders);
    console.log('🔍 [KitchenView] tableOrdersList (FILTRADO PARA COCINA):', {
      selectedTable,
      allOrdersCount: allOrders.length,
      kitchenOrdersCount: kitchenOrders.length,
      allOrders: allOrders.map(o => ({ id: o.item.id, name: o.item.nameEs, category: o.item.category })),
      kitchenOrders: kitchenOrders.map(o => ({ id: o.item.id, name: o.item.nameEs, category: o.item.category })),
      lastUpdate
    });
    return kitchenOrders;
  }, [selectedTable, tableOrders, lastUpdate, getTableOrders]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍🍳 Vista de Cocina</Text>
      
      {/* Lista de mesas ocupadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Mesas con Pedidos {occupiedTables.length > 0 ? `(${occupiedTables.length})` : ''}
        </Text>
        {occupiedTables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mesas con pedidos de cocina</Text>
            <Text style={styles.emptySubtext}>
              Agrega items a una mesa desde la vista de camarero
            </Text>
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
            type="kitchen"
            date={new Date().toISOString()}
            showPrices={false}
          />
        </ScrollView>
      )}

      {selectedTable && tableOrdersList.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No hay pedidos de cocina en esta mesa
          </Text>
          <Text style={styles.emptySubtext}>
            (Los items de ensaladas/bebidas no se muestran aquí)
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
  ticketContainer: {
    flex: 1,
  },
});

export default KitchenView;

