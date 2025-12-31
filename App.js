import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { menuData } from './menuData';
import TablesScreen from './components/TablesScreen';
import MenuByCategory from './components/MenuByCategory';
import OrderView from './components/OrderView';
import ChangeTableModal from './components/ChangeTableModal';
import DiscountCalculator from './components/DiscountCalculator';
import ViewSelector from './components/ViewSelector';
import KitchenView from './components/KitchenView';
import WaiterOrdersView from './components/WaiterOrdersView';
import ClientView from './components/ClientView';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { TableOrdersProvider, useTableOrdersContext } from './contexts/TableOrdersContext';
import { shouldAutoPrint, generatePrintData, formatPrintText, filterKitchenOrders } from './utils/printHelpers';
import { getTotalPrice } from './utils/helpers';

// Componente principal de la aplicación
function AppContent() {
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtras, setSelectedExtras] = useState({});
  const [selectedDrink, setSelectedDrink] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('tables'); // 'tables' o 'menu'
  const [showOrderView, setShowOrderView] = useState(false);

  // Contexto de la aplicación
  const { currentView, setLastUpdate } = useAppContext();

  // Hook personalizado para manejar pedidos (desde contexto compartido)
  const {
    tableOrders,
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    getTableTotal,
    isTableOccupied,
    clearTable,
    getTableOrders,
    moveTableOrders,
    setTableDiscount,
    getTableDiscount,
    getTableTotalWithDiscount,
    payTableItems,
    getTableHistory,
    getTableHistoryTotal
  } = useTableOrdersContext();

  // Estados para modales
  const [showChangeTableModal, setShowChangeTableModal] = useState(false);
  const [showDiscountCalculator, setShowDiscountCalculator] = useState(false);

  // Función wrapper para mover mesas que actualiza el estado
  const handleMoveTable = (fromTable, toTable) => {
    const success = moveTableOrders(fromTable, toTable);
    if (success) {
      setSelectedTable(toTable);
    }
    return success;
  };

  // Función para manejar impresión automática
  const handleAutoPrint = (item, drink, tableNumber) => {
    // Crear un pedido temporal solo con el item recién agregado
    const extras = selectedExtras[item.id] || [];
    const tempOrder = {
      orderId: Date.now(),
      id: item.id,
      item: item,
      quantity: 1,
      extras: extras,
      drink: drink,
      price: getTotalPrice(item, { [item.id]: extras })
    };
    
    if (shouldAutoPrint(item, drink)) {
      // Es ensalada, edamame o bebida -> imprimir automáticamente para camarero
      const printData = generatePrintData(tableNumber, [tempOrder], 'salads_drinks');
      const printText = formatPrintText(printData);
      
      // TODO: Implementar impresión real aquí
      console.log('🖨️ IMPRESIÓN AUTOMÁTICA (Camarero - Ensalada/Bebida/Edamame):');
      console.log(printText);
    } else {
      // Es otro tipo de item -> enviar comanda a cocina automáticamente
      const printData = generatePrintData(tableNumber, [tempOrder], 'kitchen');
      const printText = formatPrintText(printData);
      
      // TODO: Implementar sincronización con cocina aquí
      console.log('👨‍🍳 COMANDA AUTOMÁTICA (Cocina):');
      console.log(printText);
      
      // Actualizar el contexto para notificar a la vista de cocina
      if (setLastUpdate) {
        setLastUpdate(Date.now());
      }
    }
  };

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
      
      // Mostrar automáticamente la vista de pedido
      setShowOrderView(true);
      
      // Ya no se imprime automáticamente - se hace con botón de confirmación
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

    const drink = selectedDrink[item.id] || null;
    console.log('🔍 [App] handleAddItem:', {
      selectedTable,
      itemId: item.id,
      itemName: item.nameEs,
      drink,
      extras: selectedExtras[item.id]
    });
    
    addItemToTable(selectedTable, item, selectedExtras, drink);

    // Mostrar automáticamente la vista de pedido cuando se agrega un item
    setShowOrderView(true);
    
    console.log('🔍 [App] Después de addItemToTable, showOrderView:', true);

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

    // Ya no se imprime automáticamente - se hace con botón de confirmación
  };

  // Obtener datos del pedido actual (usando useMemo para actualización reactiva)
  const currentOrders = useMemo(() => {
    if (!selectedTable) {
      console.log('🔍 [App] currentOrders: No hay mesa seleccionada');
      return [];
    }
    const orders = getTableOrders(selectedTable);
    console.log('🔍 [App] currentOrders:', {
      selectedTable,
      ordersCount: orders.length,
      orders: orders.map(o => ({ id: o.item.id, name: o.item.nameEs, quantity: o.quantity }))
    });
    return orders;
  }, [selectedTable, tableOrders]);
  
  const currentTotal = selectedTable ? getTableTotal(selectedTable) : 0;
  const currentDiscount = selectedTable ? getTableDiscount(selectedTable) : 0;
  const currentTotalWithDiscount = selectedTable ? getTableTotalWithDiscount(selectedTable) : 0;
  const currentOccupied = selectedTable ? isTableOccupied(selectedTable) : false;
  const historyTotal = selectedTable ? getTableHistoryTotal(selectedTable) : 0;

  // Manejar selección de mesa
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setCurrentScreen('menu');
  };

  // Si estamos en vista de cocina, mostrar KitchenView
  if (currentView === 'kitchen') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ViewSelector />
        <KitchenView />
      </SafeAreaView>
    );
  }

  // Si estamos en vista de comandas de camarero
  if (currentView === 'waiter-orders') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ViewSelector />
        <WaiterOrdersView />
      </SafeAreaView>
    );
  }

  // Si estamos en vista de cliente
  if (currentView === 'client') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ViewSelector />
        <ClientView />
      </SafeAreaView>
    );
  }

  // Renderizar pantalla de mesas
  if (currentScreen === 'tables') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ViewSelector />
        <TablesScreen
          onSelectTable={handleSelectTable}
          isTableOccupied={isTableOccupied}
          selectedTable={selectedTable}
        />
      </SafeAreaView>
    );
  }

  // Renderizar pantalla de menú (vista de camarero)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ViewSelector />
      
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
          totalWithDiscount={currentTotalWithDiscount}
          discount={currentDiscount}
          occupied={currentOccupied}
          historyTotal={historyTotal}
          onRemoveItem={removeItemFromTable}
          onUpdateQuantity={updateItemQuantity}
          onClearTable={clearTable}
          onShowChangeTable={() => setShowChangeTableModal(true)}
          onShowDiscount={() => setShowDiscountCalculator(true)}
          onPayItems={(orderIds) => payTableItems(selectedTable, orderIds)}
          onPayAll={() => payTableItems(selectedTable, null)}
        />
      )}

      {/* Modal de Cambiar Mesa */}
      <ChangeTableModal
        visible={showChangeTableModal}
        onClose={() => setShowChangeTableModal(false)}
        currentTable={selectedTable}
        onMoveTable={handleMoveTable}
        isTableOccupied={isTableOccupied}
      />

      {/* Calculadora de Descuentos */}
      <DiscountCalculator
        visible={showDiscountCalculator}
        onClose={() => setShowDiscountCalculator(false)}
        onApply={(discount) => setTableDiscount(selectedTable, discount)}
        currentTotal={currentTotal}
      />

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

      {/* Menú agrupado por categorías */}
      <MenuByCategory
        menuData={menuData}
        searchQuery={searchQuery}
        selectedTable={selectedTable}
        selectedExtras={selectedExtras}
        selectedDrink={selectedDrink}
        onToggleExtra={toggleExtra}
        onSelectDrink={handleSelectDrink}
        onAddDrink={handleAddDrink}
        onAddItem={handleAddItem}
      />
    </SafeAreaView>
  );
}

// Componente raíz con Provider
export default function App() {
  return (
    <AppProvider>
      <TableOrdersProvider>
        <AppContent />
      </TableOrdersProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    backgroundColor: '#FFD700',
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
    color: '#1A1A1A',
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
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
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
