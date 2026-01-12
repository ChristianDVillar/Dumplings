import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { generateTables, groupTablesInRows } from '../utils/helpers';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../utils/translations';

const TablesScreen = ({ onSelectTable, isTableOccupied, selectedTable }) => {
  const tables = generateTables();
  const [viewMode, setViewMode] = useState('regular'); // 'regular', 'terrace', 'takeaway'
  const { language } = useAppContext();
  const t = useTranslations(language);

  const getViewTitle = () => {
    switch (viewMode) {
      case 'regular': return t.tables.regular;
      case 'terrace': return t.tables.terrace;
      case 'takeaway': return t.tables.takeaway;
      default: return t.tables.tables;
    }
  };

  const toggleView = () => {
    if (viewMode === 'regular') {
      setViewMode('terrace');
    } else if (viewMode === 'terrace') {
      setViewMode('takeaway');
    } else {
      setViewMode('regular');
    }
  };

  const getCurrentTables = () => {
    switch (viewMode) {
      case 'regular': return tables.regular;
      case 'terrace': return tables.terrace;
      case 'takeaway': return tables.takeaway;
      default: return tables.regular;
    }
  };

  const getTableCardStyle = () => {
    if (viewMode === 'takeaway') {
      return styles.tableCardTakeaway;
    } else if (viewMode === 'terrace') {
      return styles.tableCardTerrace;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Título y Botón de Cambiar Vista */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>
          {getViewTitle()}
        </Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleView}
        >
          <Text style={styles.toggleButtonText}>
            {t.tables.change}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mesas según el modo de vista */}
      <View style={styles.section}>
        <ScrollView 
          showsVerticalScrollIndicator={true}
          style={styles.tablesScroll}
        >
          {groupTablesInRows(getCurrentTables(), 10).map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {row.map((table) => (
                <TouchableOpacity
                  key={table}
                  style={[
                    styles.tableCard,
                    getTableCardStyle(),
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
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

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
    minHeight: 44,
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 12 : 10,
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
    width: isMobile ? 70 : 80,
    height: isMobile ? 70 : 80,
    minWidth: 70,
    minHeight: 70,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? 8 : 12,
    marginBottom: isMobile ? 8 : 12,
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
  tableCardTerrace: {
    backgroundColor: '#2A3A2A',
    borderColor: '#4CAF50',
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
    fontSize: isMobile ? 20 : 24,
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

