import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';

const OrderView = ({
  selectedTable,
  orders,
  total,
  occupied,
  onRemoveItem,
  onUpdateQuantity,
  onClearTable
}) => {
  if (!selectedTable) {
    return null;
  }

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

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay pedidos en esta mesa</Text>
        </View>
      ) : (
        <ScrollView style={styles.itemsContainer}>
          {orders.map((order) => (
            <View key={order.orderId} style={styles.orderItem}>
              <View style={styles.orderItemHeader}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{order.item.nameEs}</Text>
                  {order.item.nameEn && (
                    <Text style={styles.orderItemNameEn}>{order.item.nameEn}</Text>
                  )}
                  {order.extras.length > 0 && (
                    <Text style={styles.orderItemExtras}>
                      Extras: {order.extras.join(', ')}
                    </Text>
                  )}
                  {order.drink && (
                    <Text style={styles.orderItemDrink}>
                      {order.drink}
                    </Text>
                  )}
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
          ))}
        </ScrollView>
      )}

      {occupied && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{total.toFixed(2)}€</Text>
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 400,
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
    maxHeight: 250,
  },
  orderItem: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
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
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 15,
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
});

export default OrderView;

