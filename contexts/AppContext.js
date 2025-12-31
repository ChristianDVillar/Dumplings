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
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' o 'general'
  const [username, setUsername] = useState(null);
  
  // Rol/Vista actual: 'waiter' (camarero), 'kitchen' (cocina), 'waiter-orders' (comandas camarero), 'client' (cliente)
  const [currentView, setCurrentView] = useState('waiter');
  
  // Estado para sincronización entre vistas
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Mesa seleccionada para vista de cliente
  const [clientTable, setClientTable] = useState(null);

  const login = (role, user) => {
    setUserRole(role);
    setUsername(user);
    setIsAuthenticated(true);
    // Si es admin, mostrar vista de admin, si no, mostrar vista de camarero
    if (role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('waiter');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
    setCurrentView('waiter');
  };

  const switchView = (view) => {
    setCurrentView(view);
    setLastUpdate(Date.now()); // Actualizar timestamp para sincronización
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        userRole,
        username,
        login,
        logout,
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

