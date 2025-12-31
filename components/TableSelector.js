import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { generateTables } from '../utils/helpers';

const TableSelector = ({ 
  selectedTable, 
  onSelectTable, 
  showTableSelector, 
  onToggleSelector,
  isTableOccupied 
}) => {
  const tables = generateTables();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          selectedTable && styles.selectorButtonActive
        ]}
        onPress={onToggleSelector}
      >
        <Text style={[
          styles.selectorText,
          selectedTable && styles.selectorTextActive
        ]}>
          {selectedTable ? `Mesa: ${selectedTable}${selectedTable >= 200 && selectedTable <= 240 ? ' (Para llevar)' : ''}` : 'Seleccionar Mesa'}
        </Text>
        <Text style={styles.selectorArrow}>{showTableSelector ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {showTableSelector && (
        <View style={styles.dropdown}>
          <ScrollView style={styles.scroll} nestedScrollEnabled={true}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mesas Regulares</Text>
              <View style={styles.buttons}>
                {tables.regular.map((table) => (
                  <TouchableOpacity
                    key={table}
                    style={[
                      styles.tableButton,
                      selectedTable === table && styles.tableButtonSelected,
                      isTableOccupied(table) && styles.tableButtonOccupied
                    ]}
                    onPress={() => onSelectTable(table)}
                  >
                    <Text style={[
                      styles.tableButtonText,
                      selectedTable === table && styles.tableButtonTextSelected
                    ]}>
                      {table}
                      {isTableOccupied(table) && ' ●'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Para Llevar (200-240)</Text>
              <View style={styles.buttons}>
                {tables.takeaway.map((table) => (
                  <TouchableOpacity
                    key={table}
                    style={[
                      styles.tableButton,
                      styles.tableButtonTakeaway,
                      selectedTable === table && styles.tableButtonSelected,
                      isTableOccupied(table) && styles.tableButtonOccupied
                    ]}
                    onPress={() => onSelectTable(table)}
                  >
                    <Text style={[
                      styles.tableButtonText,
                      selectedTable === table && styles.tableButtonTextSelected
                    ]}>
                      {table}
                      {isTableOccupied(table) && ' ●'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    marginBottom: 10,
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectorButtonActive: {
    borderColor: '#F57F17',
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectorTextActive: {
    color: '#F57F17',
  },
  selectorArrow: {
    fontSize: 14,
    color: '#666',
  },
  dropdown: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    maxHeight: 400,
  },
  scroll: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tableButton: {
    width: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  tableButtonTakeaway: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
  },
  tableButtonSelected: {
    backgroundColor: '#F57F17',
    borderColor: '#F57F17',
  },
  tableButtonOccupied: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  tableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tableButtonTextSelected: {
    color: '#FFF',
  },
});

export default TableSelector;

