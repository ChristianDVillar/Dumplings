import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { menuData } from './menuData';
import { filterMenu } from './utils/helpers';
import { useTableOrders } from './hooks/useTableOrders';
import TableSelector from './components/TableSelector';
import TablesScreen from './components/TablesScreen';
import MenuItem from './components/MenuItem';
import OrderView from './components/OrderView';
import { menuItemStyles } from './styles/menuItemStyles';

export default function App() {
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtras, setSelectedExtras] = useState({});
  const [selectedDrink, setSelectedDrink] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('tables'); // 'tables' o 'menu'
  const [showOrderView, setShowOrderView] = useState(false);

  // Hook personalizado para manejar pedidos
  const {
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    getTableTotal,
    isTableOccupied,
    clearTable,
    getTableOrders
  } = useTableOrders();

  // Filtrar menú según búsqueda
  const filteredMenu = useMemo(() => {
    return filterMenu(menuData, searchQuery);
  }, [searchQuery]);

  // Funciones de manejo de extras
  const toggleExtra = (itemId, extra) => {
    setSelectedExtras(prev => {
      const current = prev[itemId] || [];
      const newExtras = current.includes(extra)
        ? current.filter(e => e !== extra)
        : [...current, extra];
      
      return {
        ...prev,
        [itemId]: newExtras.length > 0 ? newExtras : undefined
      };
    });
  };

  // Funciones de manejo de refrescos
  const handleSelectDrink = (itemId, drink) => {
    setSelectedDrink(prev => ({
      ...prev,
      [itemId]: drink
    }));
  };

  const handleAddDrink = (item, drink) => {
    if (selectedTable) {
      const extras = selectedExtras[item.id] || [];
      addItemToTable(selectedTable, item, { [item.id]: extras }, drink);
    } else {
      alert('Por favor, selecciona una mesa primero');
    }
  };

  // Función para agregar item
  const handleAddItem = (item) => {
    if (!selectedTable) {
      alert('Por favor, selecciona una mesa primero');
      return;
    }

    addItemToTable(selectedTable, item, selectedExtras, selectedDrink[item.id] || null);

    // Limpiar selecciones después de agregar (excepto refrescos)
    setSelectedExtras(prev => {
      const newState = { ...prev };
      delete newState[item.id];
      return newState;
    });
    
    if (item.id !== 93) {
      setSelectedDrink(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  // Renderizar item del menú
  const renderMenuItem = ({ item }) => {
    return (
      <MenuItem
        item={item}
        selectedTable={selectedTable}
        selectedExtras={selectedExtras}
        selectedDrink={selectedDrink}
        onToggleExtra={toggleExtra}
        onSelectDrink={handleSelectDrink}
        onAddDrink={handleAddDrink}
        onAddItem={handleAddItem}
        styles={menuItemStyles}
      />
    );
  };

  // Obtener datos del pedido actual
  const currentOrders = selectedTable ? getTableOrders(selectedTable) : [];
  const currentTotal = selectedTable ? getTableTotal(selectedTable) : 0;
  const currentOccupied = selectedTable ? isTableOccupied(selectedTable) : false;

  // Manejar selección de mesa
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setCurrentScreen('menu');
  };

  // Renderizar pantalla de mesas
  if (currentScreen === 'tables') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TablesScreen
          onSelectTable={handleSelectTable}
          isTableOccupied={isTableOccupied}
          selectedTable={selectedTable}
        />
      </SafeAreaView>
    );
  }

  // Renderizar pantalla de menú
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('tables')}
        >
          <Text style={styles.backButtonText}>← Mesas</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Menú para Camareros</Text>
        {selectedTable && (
          <Text style={styles.subtitle}>Mesa {selectedTable}</Text>
        )}
      </View>

      {/* Toggle de Vista de Pedido */}
      {selectedTable && (
        <View style={styles.orderToggleContainer}>
          <TouchableOpacity
            style={styles.orderToggleButton}
            onPress={() => setShowOrderView(!showOrderView)}
          >
            <Text style={styles.orderToggleText}>
              {showOrderView ? 'Ocultar Pedido' : 'Ver Pedido'}
              {currentOccupied && ` (${currentOrders.length} items)`}
            </Text>
            <Text style={styles.orderToggleArrow}>{showOrderView ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Vista de Pedido */}
      {showOrderView && selectedTable && (
        <OrderView
          selectedTable={selectedTable}
          orders={currentOrders}
          total={currentTotal}
          occupied={currentOccupied}
          onRemoveItem={removeItemFromTable}
          onUpdateQuantity={updateItemQuantity}
          onClearTable={clearTable}
        />
      )}

      {/* Barra de Búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por número o nombre..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contador de Resultados */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          {filteredMenu.length} {filteredMenu.length === 1 ? 'resultado' : 'resultados'}
        </Text>
      </View>

      {/* Lista de Items del Menú */}
      <FlatList
        data={filteredMenu}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Fondo oscuro basado en colores.jpeg
  },
  header: {
    backgroundColor: '#FFD700', // Amarillo brillante basado en colores.jpeg
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#FFA500',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 15,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A', // Texto oscuro sobre fondo amarillo
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFD700',
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  resultsCount: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  orderToggleContainer: {
    margin: 15,
    marginTop: 0,
    marginBottom: 10,
  },
  orderToggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  orderToggleText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  orderToggleArrow: {
    color: '#1A1A1A',
    fontSize: 12,
  },
});
