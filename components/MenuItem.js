import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getTotalPrice } from '../utils/helpers';

const EXTRA_OPTIONS = ['gambas', 'pollo', 'ternera', 'verduras'];
const DRINK_OPTIONS = [
  'Coca',
  'Coca Zero',
  'Fanta Naranja',
  'Fanta Limón',
  'Nestea Limón',
  'Nestea Maracuyá',
  'Acuarius',
  'Acuarius de Naranja'
];

const MenuItem = ({
  item,
  selectedTable,
  selectedExtras,
  selectedDrink,
  onToggleExtra,
  onSelectDrink,
  onAddDrink,
  onAddItem,
  styles: customStyles
}) => {
  const isMainDish = item.category === 'PRINCIPALES';
  const isRefrescos = item.id === 93;
  const extras = selectedExtras[item.id] || [];
  const totalPrice = getTotalPrice(item, selectedExtras);
  const selectedDrinkType = selectedDrink[item.id];

  return (
    <View style={customStyles.menuItem}>
      <View style={customStyles.menuItemHeader}>
        {item.number && (
          <View style={customStyles.numberBadge}>
            <Text style={customStyles.numberText}>{item.number}</Text>
          </View>
        )}
        <View style={customStyles.nameContainer}>
          <Text style={customStyles.nameEs}>{item.nameEs}</Text>
          {item.nameEn && (
            <Text style={customStyles.nameEn}>{item.nameEn}</Text>
          )}
        </View>
        <View style={customStyles.priceContainer}>
          {totalPrice !== item.price ? (
            <View>
              <Text style={customStyles.originalPrice}>{item.price.toFixed(2)}€</Text>
              <Text style={customStyles.price}>{totalPrice.toFixed(2)}€</Text>
            </View>
          ) : (
            <Text style={customStyles.price}>{item.price.toFixed(2)}€</Text>
          )}
        </View>
      </View>
      
      {(item.descriptionEs || item.descriptionEn) && (
        <Text style={customStyles.description}>
          {item.descriptionEs || item.descriptionEn}
        </Text>
      )}

      {isMainDish && (
        <View style={customStyles.extrasContainer}>
          <Text style={customStyles.extrasTitle}>Extras (+1€ cada uno):</Text>
          <View style={customStyles.extrasButtons}>
            {EXTRA_OPTIONS.map((extra) => {
              const isSelected = extras.includes(extra);
              return (
                <TouchableOpacity
                  key={extra}
                  style={[
                    customStyles.extraButton,
                    isSelected && customStyles.extraButtonSelected
                  ]}
                  onPress={() => onToggleExtra(item.id, extra)}
                >
                  <Text style={[
                    customStyles.extraButtonText,
                    isSelected && customStyles.extraButtonTextSelected
                  ]}>
                    {extra.charAt(0).toUpperCase() + extra.slice(1)}
                    {isSelected && ' ✓'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {extras.length > 0 && (
            <Text style={customStyles.extrasTotal}>
              Extras seleccionados: {extras.length} (+{extras.length.toFixed(2)}€)
            </Text>
          )}
        </View>
      )}

      {isRefrescos && (
        <View style={customStyles.drinkContainer}>
          <Text style={customStyles.drinkTitle}>Toca para agregar el refresco:</Text>
          <View style={customStyles.drinkButtons}>
            {DRINK_OPTIONS.map((drink) => {
              const isSelected = selectedDrinkType === drink;
              return (
                <TouchableOpacity
                  key={drink}
                  style={[
                    customStyles.drinkButton,
                    isSelected && customStyles.drinkButtonSelected
                  ]}
                  onPress={() => {
                    onSelectDrink(item.id, drink);
                    onAddDrink(item, drink);
                  }}
                >
                  <Text style={[
                    customStyles.drinkButtonText,
                    isSelected && customStyles.drinkButtonTextSelected
                  ]}>
                    {drink}
                    {isSelected && ' ✓'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedDrinkType && (
            <Text style={customStyles.drinkSelected}>
              Refresco seleccionado: {selectedDrinkType}
            </Text>
          )}
        </View>
      )}
      
      <View style={customStyles.menuItemFooter}>
        <View style={customStyles.categoryContainer}>
          <Text style={customStyles.category}>{item.category}</Text>
          {item.categoryEn !== item.category && (
            <Text style={customStyles.categoryEn}>{item.categoryEn}</Text>
          )}
        </View>
        {item.quantity && (
          <Text style={customStyles.quantity}>{item.quantity}</Text>
        )}
        {item.customizable && (
          <View style={customStyles.customizableBadge}>
            <Text style={customStyles.customizableText}>¡Personalizado!</Text>
          </View>
        )}
      </View>

      {!isRefrescos && (
        <TouchableOpacity
          style={[
            customStyles.addButton,
            !selectedTable && customStyles.addButtonDisabled
          ]}
          onPress={() => onAddItem(item)}
          disabled={!selectedTable}
        >
          <Text style={customStyles.addButtonText}>
            {selectedTable ? `Agregar a Mesa ${selectedTable}` : 'Selecciona una mesa'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MenuItem;

