import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppContext } from '../contexts/AppContext';

const ViewSelector = () => {
  const { currentView, switchView } = useAppContext();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          currentView === 'waiter' && styles.buttonActive
        ]}
        onPress={() => switchView('waiter')}
      >
        <Text style={[
          styles.buttonText,
          currentView === 'waiter' && styles.buttonTextActive
        ]}>
          👨‍💼 Camarero
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button,
          currentView === 'waiter-orders' && styles.buttonActive
        ]}
        onPress={() => switchView('waiter-orders')}
      >
        <Text style={[
          styles.buttonText,
          currentView === 'waiter-orders' && styles.buttonTextActive
        ]}>
          📋 Comandas
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button,
          currentView === 'kitchen' && styles.buttonActive
        ]}
        onPress={() => switchView('kitchen')}
      >
        <Text style={[
          styles.buttonText,
          currentView === 'kitchen' && styles.buttonTextActive
        ]}>
          👨‍🍳 Cocina
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button,
          currentView === 'client' && styles.buttonActive
        ]}
        onPress={() => switchView('client')}
      >
        <Text style={[
          styles.buttonText,
          currentView === 'client' && styles.buttonTextActive
        ]}>
          👤 Cliente
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    margin: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  buttonActive: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  buttonTextActive: {
    color: '#1A1A1A',
  },
});

export default ViewSelector;

