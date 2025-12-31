import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { getCategoryDisplayName } from '../utils/menuCategories';

/**
 * Componente para mostrar el ticket final del cliente
 */
const ClientTicket = ({ tableNumber, orders, subtotal, discount, total, date }) => {
  // Agrupar por categoría
  const grouped = {};
  orders.forEach(order => {
    const category = order.item.category || 'OTROS';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(order);
  });

  const dateStr = date ? new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const timeStr = date ? new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <View style={styles.ticket}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TICKET DE PEDIDO</Text>
        <View style={styles.headerDivider} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>MESA: {tableNumber}</Text>
          {dateStr && <Text style={styles.headerText}>FECHA: {dateStr}</Text>}
          {timeStr && <Text style={styles.headerText}>HORA: {timeStr}</Text>}
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Items con detalles */}
      <View style={styles.itemsContainer}>
        <Text style={styles.sectionTitle}>DETALLE DE SU PEDIDO</Text>
        {Object.entries(grouped).map(([category, categoryOrders]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{getCategoryDisplayName(category)}</Text>
            {categoryOrders.map((order) => (
              <View key={order.orderId} style={styles.itemRow}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemQuantity}>{order.quantity}x</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{order.item.nameEs}</Text>
                    {order.item.nameEn && (
                      <Text style={styles.itemNameEn}>{order.item.nameEn}</Text>
                    )}
                    {order.item.number && (
                      <Text style={styles.itemNumber}>#{order.item.number}</Text>
                    )}
                    {order.extras && order.extras.length > 0 && (
                      <View style={styles.extrasContainer}>
                        <Text style={styles.extrasLabel}>Extras:</Text>
                        <View style={styles.extrasTags}>
                          {order.extras.map((extra, idx) => (
                            <View key={idx} style={styles.extraTag}>
                              <Text style={styles.extraText}>{extra}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    {order.drink && (
                      <View style={styles.drinkContainer}>
                        <Text style={styles.drinkText}>🍹 {order.drink}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.itemPrice}>
                  {(order.price * order.quantity).toFixed(2)}€
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Resumen de precios */}
      <View style={styles.summary}>
        <View style={styles.summaryDivider} />
        <Text style={styles.summaryTitle}>RESUMEN</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>{subtotal.toFixed(2)}€</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Descuento:</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>
              -{discount.toFixed(2)}€
            </Text>
          </View>
        )}
        <View style={styles.totalDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
        </View>
        <View style={styles.summaryDivider} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>¡Gracias por su visita!</Text>
      </View>
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
    fontSize: 22,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
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
    marginBottom: 10,
    paddingLeft: 5,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemNameEn: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  itemNumber: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  extrasContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  extrasLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  extrasTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  extraTag: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  extraText: {
    fontSize: 10,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  drinkContainer: {
    marginTop: 4,
    padding: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  drinkText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
  summary: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 10,
    marginTop: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  discountValue: {
    color: '#F44336',
  },
  totalDivider: {
    height: 2,
    backgroundColor: '#000',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
});

export default ClientTicket;

