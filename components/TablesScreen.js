import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { generateTables, groupTablesInRows } from '../utils/helpers';

const TablesScreen = ({ onSelectTable, isTableOccupied, selectedTable }) => {
  const tables = generateTables();
  const [showRegular, setShowRegular] = useState(true); // Por defecto mostrar mesas regulares

  const toggleView = () => {
    setShowRegular(!showRegular);
  };

  return (
    <View style={styles.container}>
      {/* Título y Botón de Cambiar Vista */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>
          {showRegular ? 'Mesas Regulares' : 'Para Llevar'}
        </Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleView}
        >
          <Text style={styles.toggleButtonText}>
            Mesas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mesas Regulares */}
      {showRegular && (
        <View style={styles.section}>
          <ScrollView 
            showsVerticalScrollIndicator={true}
            style={styles.tablesScroll}
          >
            {groupTablesInRows(tables.regular, 10).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {row.map((table) => (
                  <TouchableOpacity
                    key={table}
                    style={[
                      styles.tableCard,
                      selectedTable === table && styles.tableCardSelected,
                      isTableOccupied(table) && styles.tableCardOccupied
                    ]}
                    onPress={() => onSelectTable(table)}
                  >
                    <Text style={[
                      styles.tableNumber,
                      selectedTable === table && styles.tableNumberSelected
                    ]}>
                      {table}
                    </Text>
                    {isTableOccupied(table) && (
                      <View style={styles.occupiedIndicator}>
                        <Text style={styles.occupiedText}>●</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Para Llevar */}
      {!showRegular && (
        <View style={styles.section}>
          <ScrollView 
            showsVerticalScrollIndicator={true}
            style={styles.tablesScroll}
          >
            {groupTablesInRows(tables.takeaway, 10).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {row.map((table) => (
                  <TouchableOpacity
                    key={table}
                    style={[
                      styles.tableCard,
                      styles.tableCardTakeaway,
                      selectedTable === table && styles.tableCardSelected,
                      isTableOccupied(table) && styles.tableCardOccupied
                    ]}
                    onPress={() => onSelectTable(table)}
                  >
                    <Text style={[
                      styles.tableNumber,
                      selectedTable === table && styles.tableNumberSelected
                    ]}>
                      {table}
                    </Text>
                    {isTableOccupied(table) && (
                      <View style={styles.occupiedIndicator}>
                        <Text style={styles.occupiedText}>●</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Fondo oscuro basado en colores.jpeg
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFA500',
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
  toggleButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    flex: 1,
    marginBottom: 25,
  },
  tablesScroll: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  tableCard: {
    width: 80,
    height: 80,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
    borderWidth: 2,
    borderColor: '#FFD700',
    position: 'relative',
  },
  tableCardTakeaway: {
    backgroundColor: '#1A2A3A',
    borderColor: '#90CAF9',
  },
  tableCardSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  tableCardOccupied: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  tableNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  tableNumberSelected: {
    color: '#1A1A1A',
  },
  occupiedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  occupiedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default TablesScreen;

