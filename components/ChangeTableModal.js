import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { generateTables } from '../utils/helpers';

const ChangeTableModal = ({ visible, onClose, currentTable, onMoveTable, isTableOccupied }) => {
  const [selectedNewTable, setSelectedNewTable] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const tables = generateTables();

  const handleMove = () => {
    if (!selectedNewTable) {
      Alert.alert('Error', 'Por favor selecciona una mesa destino');
      return;
    }
    
    // Normalizar para comparación
    if (Number(selectedNewTable) === Number(currentTable)) {
      Alert.alert('Error', 'No puedes mover a la misma mesa');
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmMove = () => {
    setShowConfirmDialog(false);
    const success = onMoveTable(currentTable, selectedNewTable);
    if (success) {
      setSelectedNewTable(null);
      onClose();
    } else {
      Alert.alert('Error', 'No se pudo mover la mesa. Verifica que haya pedidos para mover.');
    }
  };

  const cancelMove = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Modal
        visible={visible && !showConfirmDialog}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Cambiar Mesa</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Mesa actual: {currentTable}</Text>
            <Text style={styles.instruction}>Selecciona la mesa destino:</Text>

            <ScrollView style={styles.tablesContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mesas Regulares</Text>
                <View style={styles.tablesGrid}>
                  {tables.regular.map((table) => (
                    <TouchableOpacity
                      key={table}
                      style={[
                        styles.tableButton,
                        selectedNewTable === table && styles.tableButtonSelected,
                        isTableOccupied(table) && styles.tableButtonOccupied,
                        table === currentTable && styles.tableButtonCurrent
                      ]}
                      onPress={() => setSelectedNewTable(table)}
                      disabled={table === currentTable}
                    >
                      <Text style={[
                        styles.tableButtonText,
                        selectedNewTable === table && styles.tableButtonTextSelected
                      ]}>
                        {table}
                        {table === currentTable ? ' (Actual)' : ''}
                        {isTableOccupied(table) ? ' ●' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Para Llevar</Text>
                <View style={styles.tablesGrid}>
                  {tables.takeaway.map((table) => (
                    <TouchableOpacity
                      key={table}
                      style={[
                        styles.tableButton,
                        styles.tableButtonTakeaway,
                        selectedNewTable === table && styles.tableButtonSelected,
                        isTableOccupied(table) && styles.tableButtonOccupied,
                        table === currentTable && styles.tableButtonCurrent
                      ]}
                      onPress={() => setSelectedNewTable(table)}
                      disabled={table === currentTable}
                    >
                      <Text style={[
                        styles.tableButtonText,
                        selectedNewTable === table && styles.tableButtonTextSelected
                      ]}>
                        {table}
                        {table === currentTable ? ' (Actual)' : ''}
                        {isTableOccupied(table) ? ' ●' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.moveButton,
                  !selectedNewTable && styles.disabledButton
                ]}
                onPress={handleMove}
                disabled={!selectedNewTable}
              >
                <Text style={styles.moveButtonText}>Mover a Mesa {selectedNewTable || ''}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación */}
      <Modal
        visible={showConfirmDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelMove}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Cambiar Mesa</Text>
            <Text style={styles.confirmMessage}>
              ¿Mover todos los pedidos de la mesa {currentTable} a la mesa {selectedNewTable}?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelConfirmButton]}
                onPress={cancelMove}
              >
                <Text style={styles.confirmButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.moveConfirmButton]}
                onPress={confirmMove}
              >
                <Text style={[styles.confirmButtonText, styles.moveConfirmButtonText]}>Mover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFA500',
    marginBottom: 5,
  },
  instruction: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 15,
  },
  tablesContainer: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tableButton: {
    width: 70,
    height: 60,
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  tableButtonTakeaway: {
    backgroundColor: '#1A2A3A',
    borderColor: '#90CAF9',
  },
  tableButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  tableButtonOccupied: {
    borderColor: '#4CAF50',
  },
  tableButtonCurrent: {
    backgroundColor: '#1A1A1A',
    borderColor: '#999',
    opacity: 0.5,
  },
  tableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  tableButtonTextSelected: {
    color: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  moveButton: {
    backgroundColor: '#FFD700',
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  cancelButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moveButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmDialog: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#FFA500',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelConfirmButton: {
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  moveConfirmButton: {
    backgroundColor: '#FFD700',
  },
  confirmButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moveConfirmButtonText: {
    color: '#1A1A1A',
  },
});

export default ChangeTableModal;

