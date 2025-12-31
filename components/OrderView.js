import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform, Dimensions } from 'react-native';
import { generatePrintData, formatPrintText, filterSaladsAndDrinks, filterKitchenOrders } from '../utils/printHelpers';
import { useAppContext } from '../contexts/AppContext';

const OrderView = ({
  selectedTable,
  orders,
  total,
  totalWithDiscount,
  discount,
  occupied,
  historyTotal,
  onRemoveItem,
  onUpdateQuantity,
  onClearTable,
  onShowChangeTable,
  onShowDiscount,
  onPayItems,
  onPayAll,
  setKitchenTimestamp
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const { currentView, setLastUpdate } = useAppContext();
  
  // Función para enviar todo a impresión (ensaladas y bebidas) con confirmación
  const handleSendAllToPrint = () => {
    const saladsAndDrinks = filterSaladsAndDrinks(orders);
    if (saladsAndDrinks.length === 0) {
      Alert.alert('Info', 'No hay ensaladas, edamame o bebidas para imprimir');
      return;
    }
    
    const totalItems = saladsAndDrinks.reduce((sum, order) => sum + order.quantity, 0);
    Alert.alert(
      'Enviar a Impresión',
      `¿Enviar ${totalItems} item(s) (ensaladas, edamame y bebidas) a impresión?\n\nMesa: ${selectedTable}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            const printData = generatePrintData(selectedTable, orders, 'salads_drinks');
            const printText = formatPrintText(printData);
            // TODO: Implementar impresión real
            console.log('🖨️ IMPRESIÓN (Camarero - Ensaladas/Bebidas/Edamame):');
            console.log(printText);
            Alert.alert('✅ Enviado', 'Ensaladas, edamame y bebidas enviadas a impresión');
          }
        }
      ]
    );
  };
  
  // Función para enviar todo a cocina
  const handleSendAllToKitchen = () => {
    const kitchenOrders = filterKitchenOrders(orders);
    const saladsAndDrinks = filterSaladsAndDrinks(orders);
    
    if (kitchenOrders.length === 0 && saladsAndDrinks.length === 0) {
      Alert.alert('Info', 'No hay items para enviar');
      return;
    }
    
    const totalKitchenItems = kitchenOrders.reduce((sum, order) => sum + order.quantity, 0);
    const totalSaladsDrinks = saladsAndDrinks.reduce((sum, order) => sum + order.quantity, 0);
    
    // Guardar referencias para usar en la función
    const tableNumber = selectedTable;
    const kitchenOrdersRef = kitchenOrders;
    const saladsAndDrinksRef = saladsAndDrinks;
    
    // Función para enviar la comanda
    const sendCommand = () => {
      // Imprimir comanda completa (todo junto)
      const allOrdersData = generatePrintData(tableNumber, orders, 'all');
      const allOrdersText = formatPrintText(allOrdersData);
      
      // Imprimir solo items de cocina
      if (kitchenOrdersRef.length > 0) {
        const kitchenData = generatePrintData(tableNumber, kitchenOrdersRef, 'kitchen');
        const kitchenText = formatPrintText(kitchenData);
        console.log('👨‍🍳 COMANDA COCINA:');
        console.log(kitchenText);
      }
      
      // Imprimir solo items de camarero
      if (saladsAndDrinksRef.length > 0) {
        const saladsData = generatePrintData(tableNumber, saladsAndDrinksRef, 'salads_drinks');
        const saladsText = formatPrintText(saladsData);
        console.log('🖨️ COMANDA CAMARERO (Impresión):');
        console.log(saladsText);
      }
      
      // Comanda completa (para referencia)
      console.log('📋 COMANDA COMPLETA (Referencia):');
      console.log(allOrdersText);
      
      // Actualizar el contexto para notificar a la vista de cocina
      if (setLastUpdate) {
        setLastUpdate(Date.now());
      }
      
      // Guardar timestamp de cuando se envió a cocina (siempre actualizar, incluso si ya existe uno previo)
      // Esto resetea el timer cada vez que se envían nuevos items
      if (setKitchenTimestamp && (kitchenOrdersRef.length > 0 || saladsAndDrinksRef.length > 0)) {
        setKitchenTimestamp(tableNumber);
      }
      
      Alert.alert('✅ Enviado', 
        `Comanda enviada:\n` +
        `👨‍🍳 Cocina: ${totalKitchenItems} item(s)\n` +
        `🖨️ Impresión: ${totalSaladsDrinks} item(s)`
      );
    };
    
    // Ejecutar directamente
    sendCommand();
    
    /* 
    // Código comentado: Alert de confirmación (descomentar si quieres confirmación)
    Alert.alert(
      'Enviar Comanda Completa',
      `Mesa: ${selectedTable}\n\n` +
      `👨‍🍳 Cocina: ${totalKitchenItems} item(s)\n` +
      `🖨️ Impresión (Camarero): ${totalSaladsDrinks} item(s)\n\n` +
      `¿Enviar comanda completa?`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel'
        },
        {
          text: 'Enviar Todo',
          onPress: () => {
            sendCommand();
          }
        }
      ],
      { cancelable: false }
    );
    */
  };

  if (!selectedTable) {
    return null;
  }

  const toggleItemSelection = (orderId) => {
    setSelectedItems(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>
            Mesa {selectedTable}
            {selectedTable >= 200 && selectedTable <= 240 && ' (Para llevar)'}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, occupied && styles.statusIndicatorOccupied]} />
            <Text style={styles.statusText}>
              {occupied ? 'Ocupada' : 'Libre'}
            </Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          {occupied && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onShowChangeTable}
              >
                <Text style={styles.actionButtonText}>Cambiar Mesa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onShowDiscount}
              >
                <Text style={styles.actionButtonText}>Descuento</Text>
              </TouchableOpacity>
            </>
          )}
          {occupied && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                Alert.alert(
                  'Limpiar Mesa',
                  '¿Limpiar la mesa? Esto eliminará todos los pedidos.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Limpiar',
                      style: 'destructive',
                      onPress: () => onClearTable(selectedTable)
                    }
                  ]
                );
              }}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay pedidos en esta mesa</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.itemsContainer}
          contentContainerStyle={styles.itemsContainerContent}
          nestedScrollEnabled={true}
        >
          {orders.map((order) => {
            const isSelected = selectedItems.includes(order.orderId);
            return (
              <View key={order.orderId} style={[
                styles.orderItem,
                isSelected && styles.orderItemSelected
              ]}>
                <View style={styles.orderItemRow}>
                  <TouchableOpacity
                    style={styles.selectCheckbox}
                    onPress={() => toggleItemSelection(order.orderId)}
                  >
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.orderItemContent}>
                    <View style={styles.orderItemHeader}>
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{order.item.nameEs}</Text>
                        {order.item.nameEn ? (
                          <Text style={styles.orderItemNameEn}>{order.item.nameEn}</Text>
                        ) : null}
                        {order.extras && order.extras.length > 0 ? (
                          <Text style={styles.orderItemExtras}>
                            Extras: {order.extras.join(', ')}
                          </Text>
                        ) : null}
                        {order.drink ? (
                          <Text style={styles.orderItemDrink}>
                            {order.drink}
                          </Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => onRemoveItem(selectedTable, order.orderId)}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.orderItemFooter}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => onUpdateQuantity(selectedTable, order.orderId, order.quantity - 1)}
                        >
                          <Text style={styles.quantityButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{order.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => onUpdateQuantity(selectedTable, order.orderId, order.quantity + 1)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.orderItemPrice}>
                        {(order.price * order.quantity).toFixed(2)}€
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {occupied && (
        <>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalAmount}>{total.toFixed(2)}€</Text>
          </View>
          {discount > 0 && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountLabel}>Descuento:</Text>
              <Text style={styles.discountAmount}>-{discount.toFixed(2)}€</Text>
            </View>
          )}
          <View style={styles.finalTotalContainer}>
            <Text style={styles.finalTotalLabel}>Total a Pagar:</Text>
            <Text style={styles.finalTotalAmount}>{totalWithDiscount.toFixed(2)}€</Text>
          </View>
          {historyTotal > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyLabel}>Total Histórico:</Text>
              <Text style={styles.historyAmount}>{historyTotal.toFixed(2)}€</Text>
            </View>
          )}
          <View style={styles.paymentButtons}>
            {selectedItems.length > 0 && (
              <TouchableOpacity
                style={[styles.payButton, styles.paySelectedButton]}
                onPress={() => {
                  Alert.alert(
                    'Pagar Items Seleccionados',
                    `¿Pagar ${selectedItems.length} item(s) seleccionado(s)?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Pagar',
                        onPress: () => {
                          onPayItems(selectedItems);
                          setSelectedItems([]);
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.payButtonText}>
                  Pagar Seleccionados ({selectedItems.length})
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.payButton, styles.payAllButton]}
              onPress={() => {
                Alert.alert(
                  'Pagar Toda la Cuenta',
                  `Total: ${totalWithDiscount.toFixed(2)}€\n¿Confirmar pago?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Pagar',
                      onPress: () => {
                        onPayAll();
                        setSelectedItems([]);
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.payButtonText}>Pagar Todo</Text>
            </TouchableOpacity>
          </View>
          
          {/* Botones de envío solo para camarero */}
          {currentView === 'waiter' && occupied && orders.length > 0 && (
            <View style={styles.printButtonsContainer}>
              <TouchableOpacity
                style={[styles.printButton, styles.printSaladsButton]}
                onPress={handleSendAllToPrint}
              >
                <Text style={styles.printButtonText}>
                  🖨️ Enviar Ensaladas/Bebidas a Impresión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.printButton, styles.printKitchenButton]}
                onPress={handleSendAllToKitchen}
              >
                <Text style={styles.printButtonText}>
                  📋 Enviar Comanda Completa
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    marginTop: 0,
    marginBottom: 10,
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
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CCC',
    marginRight: 8,
  },
  statusIndicatorOccupied: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F44336',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  itemsContainer: {
    maxHeight: 300,
    flexGrow: 0,
  },
  itemsContainerContent: {
    paddingBottom: 10,
  },
  orderItem: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  orderItemRow: {
    flexDirection: 'row',
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  orderItemNameEn: {
    fontSize: 12,
    color: '#FFA500',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  orderItemExtras: {
    fontSize: 11,
    color: '#FFD700',
    marginTop: 2,
  },
  orderItemDrink: {
    fontSize: 11,
    color: '#FFA500',
    marginTop: 2,
  },
  removeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 15,
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 22,
    padding: 8,
  },
  quantityButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectCheckbox: {
    marginRight: 10,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FFD700',
  },
  checkmark: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemSelected: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
    backgroundColor: '#2A3A2A',
  },
  discountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  discountLabel: {
    fontSize: 14,
    color: '#FFA500',
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  finalTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  finalTotalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  historyLabel: {
    fontSize: 14,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  paymentButtons: {
    marginTop: 15,
    gap: 10,
  },
  payButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  paySelectedButton: {
    backgroundColor: '#2196F3',
  },
  payAllButton: {
    backgroundColor: '#4CAF50',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  printButtonsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  printButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  printSaladsButton: {
    backgroundColor: '#90CAF9',
    borderColor: '#64B5F6',
  },
  printKitchenButton: {
    backgroundColor: '#FFA500',
    borderColor: '#FF8C00',
  },
  printButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OrderView;

