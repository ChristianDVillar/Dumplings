import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const author = 'Christian D. Villar';
  // Obtener versión del package.json
  const packageJson = require('../package.json');
  const version = packageJson.version;

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Creado por <Text style={styles.authorName}>{author}</Text>
      </Text>
      <Text style={styles.footerText}>
        {currentYear} • Versión {version}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  footerText: {
    fontSize: 12,
    color: '#FFA500',
    textAlign: 'center',
    marginVertical: 2,
  },
  authorName: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default Footer;

