import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { getCategoryDisplayName } from '../utils/menuCategories';

/**
 * Componente para mostrar una comanda formateada como ticket
 */
const ComandaTicket = ({ tableNumber, orders, type, date, showPrices = true, comment = null }) => {
  // Agrupar por categoría
  const grouped = {};
  orders.forEach(order => {
    const category = order.item.category || 'OTROS';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(order);
  });

  const total = orders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
  const dateStr = date ? new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const timeStr = date ? new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <View style={styles.ticket}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMANDA RESTAURANTE</Text>
        <View style={styles.headerDivider} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>MESA: {tableNumber}</Text>
          {dateStr && <Text style={styles.headerText}>FECHA: {dateStr}</Text>}
          {timeStr && <Text style={styles.headerText}>HORA: {timeStr}</Text>}
          <Text style={styles.headerText}>
            TIPO: {type === 'kitchen' ? 'COCINA' : type === 'salads_drinks' ? 'IMPRESIÓN' : 'COMPLETA'}
          </Text>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Comentario */}
      {comment && (
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>💬 COMENTARIO:</Text>
          <Text style={styles.commentText}>{comment}</Text>
          <View style={styles.commentDivider} />
        </View>
      )}

      {/* Items */}
      <View style={styles.itemsContainer}>
        {Object.entries(grouped).map(([category, categoryOrders]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{getCategoryDisplayName(category)}</Text>
            {categoryOrders.map((order) => (
              <View key={order.orderId} style={styles.itemRow}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemQuantity}>{order.quantity}x</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{order.item.nameEs}</Text>
                    {order.item.number && (
                      <Text style={styles.itemNumber}>#{order.item.number}</Text>
                    )}
                    {order.extras && order.extras.length > 0 && (
                      <Text style={styles.itemExtras}>
                        + {order.extras.join(', ')}
                      </Text>
                    )}
                    {order.drink && (
                      <Text style={styles.itemDrink}>
                        Bebida: {order.drink}
                      </Text>
                    )}
                  </View>
                </View>
                {showPrices && (
                  <Text style={styles.itemPrice}>
                    {(order.price * order.quantity).toFixed(2)}€
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Total */}
      {showPrices && (
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    margin: 15,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    }),
    borderWidth: 2,
    borderColor: '#000',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 5,
  },
  headerInfo: {
    marginTop: 5,
  },
  headerText: {
    fontSize: 12,
    marginVertical: 2,
    fontWeight: '600',
  },
  itemsContainer: {
    marginBottom: 15,
  },
  categorySection: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingLeft: 5,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemNumber: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  itemExtras: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  itemDrink: {
    fontSize: 11,
    color: '#0066CC',
    marginTop: 2,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
  footer: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 10,
    marginTop: 10,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentSection: {
    backgroundColor: '#FFF9C4',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    marginTop: 5,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  commentText: {
    fontSize: 13,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  commentDivider: {
    height: 1,
    backgroundColor: '#FFD700',
    marginTop: 8,
  },
});

export default ComandaTicket;

