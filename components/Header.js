import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      {/* Logo de la empresa - placeholder para futuro */}
      <View style={styles.logoContainer}>
        {/* TODO: Agregar logo de la empresa aquí */}
        {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoPlaceholderText}>LOGO</Text>
        </View>
      </View>
      
      {/* Nombre de la empresa */}
      <Text style={styles.companyName}>Dumplings Restaurant</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  logoContainer: {
    marginRight: 15,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  logoPlaceholderText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1,
  },
});

export default Header;

