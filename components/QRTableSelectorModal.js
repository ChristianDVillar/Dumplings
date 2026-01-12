import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { generateTables } from '../utils/helpers';

const QRTableSelectorModal = ({ visible, onClose, onSelectTable, onGenerateAll, baseUrl }) => {
  const tables = generateTables();
  const allTables = [...tables.regular, ...tables.terrace, ...tables.takeaway];

  const handleSelectTable = (tableNumber) => {
    onSelectTable(tableNumber);
  };

  const handleGenerateAll = () => {
    Alert.alert(
      'Generar Todos los Códigos QR',
      `¿Generar códigos QR para todas las ${allTables.length} mesas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar Todos',
          onPress: () => {
            onGenerateAll(allTables);
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📱 Generar Códigos QR</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Selecciona una mesa o genera todas:</Text>
            
            <TouchableOpacity
              style={styles.generateAllButton}
              onPress={handleGenerateAll}
            >
              <Text style={styles.generateAllButtonText}>
                🎯 Generar Todos los Códigos QR ({allTables.length} mesas)
              </Text>
            </TouchableOpacity>

            <View style={styles.tablesContainer}>
              <Text style={styles.tablesSectionTitle}>Mesas Regulares</Text>
              <View style={styles.tablesGrid}>
                {tables.regular.map((table) => (
                  <TouchableOpacity
                    key={table}
                    style={styles.tableButton}
                    onPress={() => handleSelectTable(table)}
                  >
                    <Text style={styles.tableButtonText}>{table}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {tables.terrace.length > 0 && (
              <View style={styles.tablesContainer}>
                <Text style={styles.tablesSectionTitle}>Terraza</Text>
                <View style={styles.tablesGrid}>
                  {tables.terrace.map((table) => (
                    <TouchableOpacity
                      key={table}
                      style={[styles.tableButton, styles.tableButtonTerrace]}
                      onPress={() => handleSelectTable(table)}
                    >
                      <Text style={styles.tableButtonText}>{table}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.tablesContainer}>
              <Text style={styles.tablesSectionTitle}>Para Llevar</Text>
              <View style={styles.tablesGrid}>
                {tables.takeaway.map((table) => (
                  <TouchableOpacity
                    key={table}
                    style={[styles.tableButton, styles.tableButtonTakeaway]}
                    onPress={() => handleSelectTable(table)}
                  >
                    <Text style={styles.tableButtonText}>{table}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#FFD700',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  generateAllButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
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
  generateAllButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tablesContainer: {
    marginBottom: 25,
  },
  tablesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFA500',
    paddingBottom: 5,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tableButton: {
    width: 70,
    height: 70,
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  tableButtonTerrace: {
    borderColor: '#4CAF50',
    backgroundColor: '#2A3A2A',
  },
  tableButtonTakeaway: {
    borderColor: '#90CAF9',
    backgroundColor: '#1A2A3A',
  },
  tableButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default QRTableSelectorModal;
