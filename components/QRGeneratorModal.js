import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, Image } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../utils/translations';

const QRGeneratorModal = ({ visible, onClose, tableNumber, baseUrl, logoUrl, restaurantName = 'Dumplings Restaurant' }) => {
  const { language } = useAppContext();
  const t = useTranslations(language);
  const [selectedTable, setSelectedTable] = useState(tableNumber);
  
  // Generar URL para el QR
  const generateQRUrl = (table) => {
    if (!baseUrl) {
      // Si no hay baseUrl, usar la URL actual
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      return `${currentUrl}/?table=${table}&mode=client`;
    }
    return `${baseUrl}/?table=${table}&mode=client`;
  };

  // Generar URL de imagen QR usando API (vista previa)
  const getQRImageUrl = (table) => {
    const url = generateQRUrl(table);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
  };

  // Generar URL de imagen QR para descarga (5cm alto x 20cm ancho = 590px x 2362px a 300 DPI)
  const getQRImageUrlForDownload = (table) => {
    const url = generateQRUrl(table);
    // 5 cm alto = 590 píxeles, 20 cm ancho = 2362 píxeles (a 300 DPI)
    // El QR será cuadrado, así que usamos el tamaño del lado más pequeño
    return `https://api.qrserver.com/v1/create-qr-code/?size=590x590&data=${encodeURIComponent(url)}`;
  };

  const handleDownload = () => {
    // En web, podemos copiar la URL al portapapeles o mostrar un mensaje
    const url = generateQRUrl(selectedTable || tableNumber);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      Alert.alert(t.common.success, t.qr.copySuccess);
    } else {
      Alert.alert(language === 'es' ? 'URL de la Mesa' : 'Table URL', url);
    }
  };

  const handleDownloadQR = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const table = selectedTable || tableNumber;
      const qrImageUrl = getQRImageUrlForDownload(table);
      
      // Crear un elemento img del DOM para cargar la imagen del QR
      const qrImg = document.createElement('img');
      qrImg.crossOrigin = 'anonymous';
      
      // Cargar el logo si está disponible
      const logoToUse = logoUrl || 'https://via.placeholder.com/150x150/FFD700/000000?text=Dumplings';
      const logoImg = document.createElement('img');
      logoImg.crossOrigin = 'anonymous';
      
      let qrLoaded = false;
      let logoLoaded = false;
      
      const tryRender = () => {
        if (!qrLoaded) return;
        
        try {
          // Crear un canvas con las dimensiones exactas (5cm alto x 20cm ancho)
          const canvas = document.createElement('canvas');
          // 5 cm alto x 20 cm ancho a 300 DPI = 590px x 2362px
          canvas.width = 2362; // 20cm ancho
          canvas.height = 590; // 5cm alto
          const ctx = canvas.getContext('2d');
          
          // Fondo blanco
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Margen
          const margin = 40;
          const contentWidth = canvas.width - (margin * 2);
          const contentHeight = canvas.height - (margin * 2);
          
          // Tamaño del QR (cuadrado, basado en la altura disponible)
          const qrSize = Math.min(contentHeight, 500);
          const qrX = margin;
          const qrY = margin + (contentHeight - qrSize) / 2;
          
          // Dibujar el QR code
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          
          // Área para logo y texto (a la derecha del QR)
          const rightAreaX = qrX + qrSize + 60;
          const rightAreaWidth = canvas.width - rightAreaX - margin;
          const rightAreaY = margin;
          const rightAreaHeight = contentHeight;
          
          // Dibujar logo si está cargado
          if (logoLoaded && logoImg.complete) {
            const logoSize = 120;
            const logoX = rightAreaX + (rightAreaWidth - logoSize) / 2;
            const logoY = rightAreaY + 40;
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          }
          
          // Agregar nombre del restaurante
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 80px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const restaurantNameY = logoLoaded && logoImg.complete ? rightAreaY + 180 : rightAreaY + 80;
          ctx.fillText(restaurantName, rightAreaX + rightAreaWidth / 2, restaurantNameY);
          
          // Agregar texto con el número de mesa
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 100px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const tableTextY = restaurantNameY + 120;
          ctx.fillText(`${t.qr.table} ${table}`, rightAreaX + rightAreaWidth / 2, tableTextY);
          
          // Agregar texto instructivo
          ctx.fillStyle = '#666666';
          ctx.font = '40px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const instructionY = tableTextY + 140;
          ctx.fillText(t.qr.scanInstruction, rightAreaX + rightAreaWidth / 2, instructionY);
          
          // Convertir canvas a blob y descargar
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-mesa-${table}-dumplings-restaurant.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            Alert.alert(t.common.success, t.qr.successMessage(table));
          }, 'image/png');
        } catch (error) {
          console.error('Error al generar imagen:', error);
          Alert.alert('Error', 'No se pudo generar la imagen para descargar');
        }
      };
      
      qrImg.onload = () => {
        qrLoaded = true;
        tryRender();
      };
      
      qrImg.onerror = () => {
        Alert.alert('Error', 'No se pudo cargar la imagen del QR');
      };
      
      logoImg.onload = () => {
        logoLoaded = true;
        tryRender();
      };
      
      logoImg.onerror = () => {
        // Si el logo falla, continuar sin él
        logoLoaded = true;
        tryRender();
      };
      
      // Cargar ambas imágenes
      qrImg.src = qrImageUrl;
      logoImg.src = logoToUse;
    } else {
      Alert.alert('Info', 'La descarga de QR está disponible solo en la versión web');
    }
  };


  const qrUrl = generateQRUrl(selectedTable || tableNumber);
  const displayTable = selectedTable || tableNumber;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.qr.modalTitle(displayTable)}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>

            <View style={styles.qrContainer}>
              <Image
                source={{ uri: getQRImageUrl(selectedTable || tableNumber) }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>{t.qr.tableLabel}</Text>
              <Text style={styles.infoValue}>{displayTable}</Text>
            </View>

            <View style={styles.urlContainer}>
              <Text style={styles.urlLabel}>{t.qr.urlLabel}</Text>
              <Text style={styles.urlText} selectable={true}>{qrUrl}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.downloadButton, styles.downloadButtonHalf]}
                onPress={handleDownload}
              >
                <Text style={styles.downloadButtonText}>
                  {t.qr.copyUrl}
                </Text>
              </TouchableOpacity>
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  style={[styles.downloadButton, styles.downloadButtonHalf, styles.downloadQRButton]}
                  onPress={handleDownloadQR}
                >
                  <Text style={styles.downloadButtonText}>
                    {t.qr.downloadQR}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>{t.qr.instructions}</Text>
              <Text style={styles.instructionsText}>
                {t.qr.instruction1}{'\n'}
                {t.qr.instruction2}{'\n'}
                {t.qr.instruction3(displayTable)}{'\n'}
                {t.qr.instruction4}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#FFD700',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 290,
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  downloadButtonHalf: {
    flex: 1,
  },
  downloadQRButton: {
    backgroundColor: '#2196F3',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  urlContainer: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
  },
  urlText: {
    fontSize: 12,
    color: '#FFA500',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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
  downloadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#FFA500',
    lineHeight: 20,
  },
});

export default QRGeneratorModal;
