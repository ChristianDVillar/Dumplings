import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform, Dimensions, Modal, TextInput } from 'react-native';
import { generatePrintData, formatPrintText, filterSaladsAndDrinks, filterKitchenOrders } from '../utils/printHelpers';
import { useAppContext } from '../contexts/AppContext';
import { useTableOrdersContext } from '../contexts/TableOrdersContext';
import KitchenCommentModal from './KitchenCommentModal';
import { useTranslations } from '../utils/translations';

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
  setKitchenTimestamp,
  getKitchenComment,
  setKitchenComment,
  isClientMode = false
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingComment, setPendingComment] = useState(null); // Comentario pendiente para la próxima comanda
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cash'
  const [cashReceived, setCashReceived] = useState('');
  const { currentView, setLastUpdate, userRole, language } = useAppContext();
  const { getKitchenTimestamp: getKitchenTimestampFromContext, getKitchenComment: getKitchenCommentFromContext, setKitchenComment: setKitchenCommentFromContext } = useTableOrdersContext();
  const t = useTranslations(language);
  
  // Determinar si el usuario es camarero (puede agregar comentarios)
  const isWaiterView = currentView === 'waiter' || userRole === 'general';
  
  // Obtener el timestamp más reciente de la comanda para el comentario
  const getLatestKitchenTimestamp = () => {
    // Obtener el timestamp más reciente de esta mesa
    if (getKitchenTimestampFromContext) {
      const latestTimestamp = getKitchenTimestampFromContext(selectedTable);
      return latestTimestamp || Date.now();
    }
    return Date.now();
  };
  
  // Usar funciones del contexto si no se pasan como props
  const getKitchenCommentFunc = getKitchenComment || getKitchenCommentFromContext;
  const setKitchenCommentFunc = setKitchenComment || setKitchenCommentFromContext;
  
  // Función para enviar todo a cocina (incluye ensaladas/bebidas automáticamente)
  const handleSendAllToKitchen = () => {
    const kitchenOrders = filterKitchenOrders(orders);
    const saladsAndDrinks = filterSaladsAndDrinks(orders);
    
      if (kitchenOrders.length === 0 && saladsAndDrinks.length === 0) {
      Alert.alert(t.common.error, t.orders.noItemsToSend);
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
        const timestamp = setKitchenTimestamp(tableNumber); // setKitchenTimestamp ahora retorna el timestamp
        
        // Si hay un comentario pendiente, guardarlo con este timestamp
        if (pendingComment && setKitchenCommentFunc) {
          setKitchenCommentFunc(tableNumber, timestamp, pendingComment);
          setPendingComment(null); // Limpiar comentario pendiente
        }
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
        {!isClientMode && (
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
                  <Text style={styles.actionButtonText}>{t.orders.applyDiscount}</Text>
                </TouchableOpacity>
              </>
            )}
            {occupied && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  Alert.alert(
                    t.orders.clearTableTitle,
                    t.orders.clearTableMessage,
                    [
                      { text: t.common.cancel, style: 'cancel' },
                      {
                        text: t.orders.clearTable,
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
        )}
      </View>

      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.tables.noOrders}</Text>
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
                            {t.orders.extras} {order.extras.join(', ')}
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

      {/* Botón de comentarios - siempre visible para camarero */}
      {isWaiterView && selectedTable && (
        <View style={styles.commentButtonContainer}>
          <TouchableOpacity
            style={[styles.commentButtonStandalone]}
            onPress={() => setShowCommentModal(true)}
          >
            <Text style={styles.commentButtonText}>
              {pendingComment ? t.orders.editComment : t.orders.addComment}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {occupied && (
        <>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t.orders.subtotal}</Text>
            <Text style={styles.totalAmount}>{total.toFixed(2)}€</Text>
          </View>
          {discount > 0 && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountLabel}>{t.orders.discount}</Text>
              <Text style={styles.discountAmount}>-{discount.toFixed(2)}€</Text>
            </View>
          )}
          <View style={styles.finalTotalContainer}>
            <Text style={styles.finalTotalLabel}>{t.orders.totalToPay}</Text>
            <Text style={styles.finalTotalAmount}>{totalWithDiscount.toFixed(2)}€</Text>
          </View>
              {historyTotal > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyLabel}>{t.orders.historyTotal}</Text>
              <Text style={styles.historyAmount}>{historyTotal.toFixed(2)}€</Text>
            </View>
          )}
          {!isClientMode && (
            <View style={styles.paymentButtons}>
              {selectedItems.length > 0 && (
                <TouchableOpacity
                  style={[styles.payButton, styles.paySelectedButton]}
                  onPress={() => {
                    Alert.alert(
                      t.orders.paySelectedTitle,
                      t.orders.paySelectedMessage(selectedItems.length),
                      [
                        { text: t.common.cancel, style: 'cancel' },
                        {
                          text: t.payment.pay,
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
                    {t.orders.paySelected(selectedItems.length)}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.payButton, styles.payAllButton]}
                onPress={() => {
                  setShowPaymentModal(true);
                }}
              >
                <Text style={styles.payButtonText}>{t.orders.payAll}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Botón de envío solo para camarero */}
          {isWaiterView && occupied && orders.length > 0 && (
            <View style={styles.printButtonsContainer}>
              <TouchableOpacity
                style={[styles.printButton, styles.printKitchenButton]}
                onPress={handleSendAllToKitchen}
              >
                <Text style={styles.printButtonText}>
                  {t.orders.sendToKitchen}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Modal de comentarios */}
          {isWaiterView && (
            <KitchenCommentModal
              visible={showCommentModal}
              onClose={() => setShowCommentModal(false)}
              tableNumber={selectedTable}
              timestamp={getLatestKitchenTimestamp()}
              currentComment={pendingComment || (getKitchenCommentFunc ? getKitchenCommentFunc(selectedTable, getLatestKitchenTimestamp()) : null)}
              onSave={(table, timestamp, comment) => {
                if (comment.trim()) {
                  // Guardar como comentario pendiente para la próxima comanda
                  setPendingComment(comment);
                  // También guardar con el timestamp actual si existe (para mostrar en comandas anteriores)
                  if (setKitchenCommentFunc && getLatestKitchenTimestamp()) {
                    setKitchenCommentFunc(table, getLatestKitchenTimestamp(), comment);
                  }
                } else {
                  // Si el comentario está vacío, limpiar el pendiente
                  setPendingComment(null);
                }
              }}
            />
          )}

          {/* Modal de pago */}
          <Modal
            visible={showPaymentModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPaymentModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.paymentModal}>
                <Text style={styles.paymentTitle}>{t.payment.title}</Text>
                <Text style={styles.paymentAmount}>{t.payment.total} {totalWithDiscount.toFixed(2)}€</Text>

                <View style={styles.methodContainer}>
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      paymentMethod === 'card' && styles.methodButtonActive
                    ]}
                    onPress={() => {
                      setPaymentMethod('card');
                      setCashReceived('');
                    }}
                  >
                    <Text style={[
                      styles.methodButtonText,
                      paymentMethod === 'card' && styles.methodButtonTextActive
                    ]}>
                      {t.payment.card}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      paymentMethod === 'cash' && styles.methodButtonActive
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                  >
                    <Text style={[
                      styles.methodButtonText,
                      paymentMethod === 'cash' && styles.methodButtonTextActive
                    ]}>
                      {t.payment.cash}
                    </Text>
                  </TouchableOpacity>
                </View>

                {paymentMethod === 'cash' && (
                  <View style={styles.cashSection}>
                    <Text style={styles.cashLabel}>{t.payment.cashReceived}</Text>
                    <TextInput
                      style={styles.cashInput}
                      placeholder={t.payment.cashReceivedPlaceholder}
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={cashReceived}
                      onChangeText={setCashReceived}
                    />
                    <View style={styles.changeRow}>
                      <Text style={styles.changeLabel}>{t.payment.change}</Text>
                      <Text style={styles.changeValue}>
                        {(() => {
                          const received = parseFloat((cashReceived || '').replace(',', '.')) || 0;
                          const change = received - totalWithDiscount;
                          return change > 0 ? `${change.toFixed(2)}€` : '0.00€';
                        })()}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancel]}
                    onPress={() => {
                      setShowPaymentModal(false);
                      setPaymentMethod('card');
                      setCashReceived('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirm]}
                    onPress={() => {
                      if (paymentMethod === 'cash') {
                        const received = parseFloat((cashReceived || '').replace(',', '.')) || 0;
                        if (received < totalWithDiscount) {
                          Alert.alert(t.common.error, t.payment.invalidAmount);
                          return;
                        }
                      }
                      onPayAll();
                      setSelectedItems([]);
                      setShowPaymentModal(false);
                      setPaymentMethod('card');
                      setCashReceived('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>{t.payment.pay}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  commentButton: {
    backgroundColor: '#9C27B0',
    borderColor: '#7B1FA2',
  },
  commentButtonContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  commentButtonStandalone: {
    backgroundColor: '#9C27B0',
    borderColor: '#7B1FA2',
    borderWidth: 2,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  commentButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentModal: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 16,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
  },
  methodButtonActive: {
    backgroundColor: '#FFD700',
  },
  methodButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  methodButtonTextActive: {
    color: '#2A2A2A',
  },
  cashSection: {
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginBottom: 12,
  },
  cashLabel: {
    color: '#FFD700',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  cashInput: {
    backgroundColor: '#2F2F2F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    color: '#FFF',
    padding: 10,
    marginBottom: 10,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    color: '#FFD700',
    fontSize: 14,
  },
  changeValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  modalCancel: {
    backgroundColor: '#3A3A3A',
  },
  modalConfirm: {
    backgroundColor: '#FFD700',
  },
  modalButtonText: {
    color: '#2A2A2A',
    fontWeight: 'bold',
  },
});

export default OrderView;

