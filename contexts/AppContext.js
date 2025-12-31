import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Rol/Vista actual: 'waiter' (camarero), 'kitchen' (cocina), 'waiter-orders' (comandas camarero), 'client' (cliente)
  const [currentView, setCurrentView] = useState('waiter');
  
  // Estado para sincronización entre vistas
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Mesa seleccionada para vista de cliente
  const [clientTable, setClientTable] = useState(null);

  const switchView = (view) => {
    setCurrentView(view);
    setLastUpdate(Date.now()); // Actualizar timestamp para sincronización
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        switchView,
        lastUpdate,
        setLastUpdate,
        clientTable,
        setClientTable
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

