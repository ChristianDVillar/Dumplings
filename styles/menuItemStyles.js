import { StyleSheet, Platform } from 'react-native';

export const menuItemStyles = StyleSheet.create({
  menuItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  numberBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  nameEs: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  nameEn: {
    fontSize: 14,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  priceContainer: {
    marginLeft: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  description: {
    fontSize: 13,
    color: '#FFA500',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  menuItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  categoryContainer: {
    flex: 1,
  },
  category: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  categoryEn: {
    fontSize: 11,
    color: '#FFA500',
    fontStyle: 'italic',
  },
  quantity: {
    fontSize: 12,
    color: '#FFD700',
    marginLeft: 10,
    backgroundColor: '#3A3A3A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customizableBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  customizableText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  extrasContainer: {
    marginTop: 12,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  extrasTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
  },
  extrasButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  extraButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#FFD700',
    marginRight: 8,
    marginBottom: 8,
  },
  extraButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  extraButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
  },
  extraButtonTextSelected: {
    color: '#1A1A1A',
  },
  extrasTotal: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  drinkContainer: {
    marginTop: 12,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  drinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
  },
  drinkButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  drinkButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#FFD700',
    marginRight: 8,
    marginBottom: 8,
  },
  drinkButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  drinkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
  },
  drinkButtonTextSelected: {
    color: '#1A1A1A',
  },
  drinkSelected: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginTop: 8,
  },
  addButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  addButtonDisabled: {
    backgroundColor: '#3A3A3A',
    borderColor: '#555',
  },
  addButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

