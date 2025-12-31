import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Platform, Dimensions } from 'react-native';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import { generateTables } from '../utils/helpers';
import { getCategoryDisplayName } from '../utils/menuCategories';
import { statisticsService } from '../services/statisticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const StatisticsModal = ({ visible, onClose }) => {
  const { tableHistory, getTableHistory } = useTableOrdersContext();
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.takeaway];

  // Calcular estadísticas históricas usando el servicio
  const historicalStats = useMemo(() => {
    return statisticsService.calculateHistoricalStats(
      tableHistory,
      getTableHistory,
      allTables
    );
  }, [allTables, tableHistory, getTableHistory]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 Estadísticas Históricas</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Totales generales */}
            <View style={styles.totalsContainer}>
              <Text style={styles.sectionTitle}>Totales Generales</Text>
              <View style={styles.totalsGrid}>
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total Items</Text>
                  <Text style={styles.totalValue}>{historicalStats.totals.items}</Text>
                </View>
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total Pagos</Text>
                  <Text style={styles.totalValue}>{historicalStats.totals.payments}</Text>
                </View>
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Ingresos</Text>
                  <Text style={styles.totalValue}>{historicalStats.totals.revenue.toFixed(2)}€</Text>
                </View>
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Descuentos</Text>
                  <Text style={styles.totalValue}>{historicalStats.totals.discounts.toFixed(2)}€</Text>
                </View>
              </View>
            </View>

            {/* Estadísticas por categoría */}
            <View style={styles.categoryStatsContainer}>
              <Text style={styles.sectionTitle}>Por Categoría</Text>
              {historicalStats.categoryStats.length > 0 ? (
                <View style={styles.categoryGrid}>
                  {historicalStats.categoryStats.map((stat, index) => (
                    <View key={index} style={styles.categoryCard}>
                      <Text style={styles.categoryName}>
                        {getCategoryDisplayName(stat.name)}
                      </Text>
                      <Text style={styles.categoryTotal}>{stat.total} items</Text>
                      <Text style={styles.categoryRevenue}>
                        {stat.revenue.toFixed(2)}€
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    No hay datos históricos disponibles
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? 10 : 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    width: '100%',
    maxWidth: isMobile ? '100%' : 800,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#FFD700',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 10,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 15 : 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    padding: isMobile ? 15 : 20,
  },
  totalsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  totalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  totalCard: {
    flex: 1,
    minWidth: isMobile ? '45%' : '22%',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: isMobile ? 12 : 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  totalLabel: {
    fontSize: isMobile ? 12 : 14,
    color: '#FFA500',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalValue: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  categoryStatsContainer: {
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    flex: 1,
    minWidth: isMobile ? '45%' : '30%',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: isMobile ? 12 : 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: isMobile ? 13 : 15,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryTotal: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 4,
  },
  categoryRevenue: {
    fontSize: isMobile ? 14 : 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default StatisticsModal;

