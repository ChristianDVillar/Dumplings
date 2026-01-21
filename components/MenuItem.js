import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Dimensions } from 'react-native';
import { getTotalPrice } from '../utils/helpers';
import { EXTRA_OPTIONS } from '../utils/constants';
import { useMenuContext } from '../contexts/MenuContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const MenuItem = ({
  item,
  selectedTable,
  selectedExtras,
  selectedDrink,
  selectedOptions,
  onToggleExtra,
  onSelectOption,
  onSelectDrink,
  onAddDrink,
  onAddItem,
  styles: customStyles
}) => {
  const { drinkOptions } = useMenuContext();
  const isMainDish = item.category === 'PRINCIPALES';
  // Detectar refrescos por categoría y nombre, no solo por ID
  const isRefrescos = item.category === 'BEBIDAS' && (
    (item.nameEs && item.nameEs.toLowerCase().includes('refresco')) ||
    (item.nameEn && item.nameEn.toLowerCase().includes('soft drink')) ||
    (item.nameEn && item.nameEn.toLowerCase().includes('soda')) ||
    (item.nameZh && (item.nameZh.includes('汽水') || item.nameZh.includes('可乐')))
  );
  // Usar tipos de refrescos específicos del item o los globales
  const availableDrinkOptions = item.drinkOptions && item.drinkOptions.length > 0 
    ? item.drinkOptions 
    : (drinkOptions || []);
  const optionGroups = Array.isArray(item.optionGroups) ? item.optionGroups : [];
  const selectedItemOptions = (selectedOptions && selectedOptions[item.id]) || {};
  const extras = selectedExtras[item.id] || [];
  const totalPrice = getTotalPrice(item, selectedExtras);
  const selectedDrinkType = selectedDrink[item.id];

  const resolveGroupOptions = (group) => {
    if (group.useGlobalDrinkOptions) {
      return [
        ...(drinkOptions || []),
        ...(group.extraOptions || [])
      ];
    }
    return group.options || [];
  };

  // Función para agregar item al hacer clic en la imagen
  const handleImagePress = () => {
    if (!selectedTable) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }
    
    // Si es un plato principal con extras disponibles, agregar sin extras por defecto
    // Si tiene bebida seleccionada, usarla; si no, null
    const drink = selectedDrink[item.id] || null;
    const extras = isMainDish ? {} : (selectedExtras[item.id] ? { [item.id]: selectedExtras[item.id] } : {});
    
    onAddItem(item);
  };

  return (
    <View style={customStyles.menuItem}>
      {/* Imagen del item (si existe) - Clicable para agregar directamente */}
      {item.image ? (
        <TouchableOpacity
          style={customStyles.imageContainer}
          onPress={handleImagePress}
          disabled={!selectedTable}
          activeOpacity={selectedTable ? 0.7 : 1}
        >
          <Image
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={[
              customStyles.itemImage,
              !selectedTable && customStyles.itemImageDisabled
            ]}
            resizeMode="cover"
          />
          {selectedTable && (
            <View style={customStyles.imageOverlay}>
              <View style={customStyles.imageOverlayBadge}>
                <Text style={customStyles.imageOverlayText}>
                  Toca para agregar a Mesa {selectedTable}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ) : null}

      <View style={customStyles.menuItemHeader}>
        {item.number ? (
          <View style={customStyles.numberBadge}>
            <Text style={customStyles.numberText}>{item.number}</Text>
          </View>
        ) : null}
        <View style={customStyles.nameContainer}>
          <Text style={customStyles.nameEs}>{item.nameEs}</Text>
          {item.nameEn ? (
            <Text style={customStyles.nameEn}>{item.nameEn}</Text>
          ) : null}
        </View>
        <View style={customStyles.priceContainer}>
          {totalPrice !== item.price ? (
            <View>
              <Text style={customStyles.originalPrice}>{item.price.toFixed(2)}€</Text>
              <Text style={customStyles.price}>{totalPrice.toFixed(2)}€</Text>
            </View>
          ) : (
            <Text style={customStyles.price}>{totalPrice.toFixed(2)}€</Text>
          )}
        </View>
      </View>

      {(item.descriptionEs || item.descriptionEn) ? (
        <Text style={customStyles.description}>
          {item.descriptionEs || item.descriptionEn}
        </Text>
      ) : null}

      {isMainDish ? (
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
                    {isSelected ? ' ✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {extras.length > 0 ? (
            <Text style={customStyles.extrasTotal}>
              Extras seleccionados: {extras.length} (+{extras.length.toFixed(2)}€)
            </Text>
          ) : null}
        </View>
      ) : null}

      {isRefrescos ? (
        <View style={customStyles.drinkContainer}>
          <Text style={customStyles.drinkTitle}>Toca para agregar el refresco:</Text>
          <View style={customStyles.drinkButtons}>
            {availableDrinkOptions.map((drink) => {
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
                    {isSelected ? ' ✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedDrinkType ? (
            <Text style={customStyles.drinkSelected}>
              Refresco seleccionado: {selectedDrinkType}
            </Text>
          ) : null}
        </View>
      ) : null}

      {optionGroups.length > 0 ? (
        <View style={customStyles.optionGroupsContainer}>
          {optionGroups.map((group) => {
            const options = resolveGroupOptions(group);
            if (!options.length) {
              return null;
            }
            const groupLabel = group.labelEs || group.labelEn || group.id;
            return (
              <View key={group.id} style={customStyles.optionGroup}>
                <Text style={customStyles.optionGroupTitle}>{groupLabel}</Text>
                <View style={customStyles.optionButtons}>
                  {options.map((option) => {
                    const isSelected = selectedItemOptions[group.id] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          customStyles.optionButton,
                          isSelected && customStyles.optionButtonSelected
                        ]}
                        onPress={() => onSelectOption(item.id, group.id, option)}
                      >
                        <Text style={[
                          customStyles.optionButtonText,
                          isSelected && customStyles.optionButtonTextSelected
                        ]}>
                          {option}
                          {isSelected ? ' ✓' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      
      <View style={customStyles.menuItemFooter}>
        <View style={customStyles.categoryContainer}>
          <Text style={customStyles.category}>{item.category}</Text>
          {item.categoryEn !== item.category ? (
            <Text style={customStyles.categoryEn}>{item.categoryEn}</Text>
          ) : null}
        </View>
        {item.quantity ? (
          <Text style={customStyles.quantity}>{item.quantity}</Text>
        ) : null}
        {item.customizable ? (
          <View style={customStyles.customizableBadge}>
            <Text style={customStyles.customizableText}>¡Personalizado!</Text>
          </View>
        ) : null}
      </View>

      {!isRefrescos ? (
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
      ) : null}
    </View>
  );
};

export default MenuItem;

