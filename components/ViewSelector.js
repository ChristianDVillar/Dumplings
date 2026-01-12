import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../utils/translations';

const ViewSelector = () => {
  const { currentView, switchView, userRole, logout, language } = useAppContext();
  const t = useTranslations(language);

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
          {t.views.waiter}
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
          {t.views.orders}
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
          {t.views.kitchen}
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
          {t.views.client}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>
          {t.views.logout}
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
    minHeight: 44,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  logoutButton: {
    minHeight: 44,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    backgroundColor: '#F44336',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ViewSelector;

