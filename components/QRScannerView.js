import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerView = ({ onTableScanned, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const html5QrCodeRef = useRef(null);
  const scannerId = 'qr-reader';

  useEffect(() => {
    if (isScanning && Platform.OS === 'web') {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText, decodedResult) => {
          handleQRCodeScanned(decodedText);
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
        }
      );
    } catch (err) {
      console.error('Error al iniciar escáner:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.error('Error al detener escáner:', err);
    }
  };

  const handleQRCodeScanned = (decodedText) => {
    try {
      // Parsear la URL del QR
      const url = new URL(decodedText);
      const tableParam = url.searchParams.get('table');
      
      if (tableParam) {
        const tableNumber = parseInt(tableParam, 10);
        if (!isNaN(tableNumber)) {
          stopScanning();
          setIsScanning(false);
          onTableScanned(tableNumber);
        } else {
          Alert.alert('Error', 'Código QR inválido: número de mesa no encontrado');
        }
      } else {
        Alert.alert('Error', 'Código QR inválido: parámetro de mesa no encontrado');
      }
    } catch (err) {
      // Si no es una URL válida, intentar parsear directamente como número de mesa
      const tableNumber = parseInt(decodedText, 10);
      if (!isNaN(tableNumber)) {
        stopScanning();
        setIsScanning(false);
        onTableScanned(tableNumber);
      } else {
        Alert.alert('Error', 'Código QR inválido');
      }
    }
  };

  const handleStartScan = () => {
    if (Platform.OS === 'web') {
      setIsScanning(true);
      setError(null);
    } else {
      Alert.alert('Info', 'El escáner QR está disponible solo en la versión web');
    }
  };

  const handleStopScan = () => {
    stopScanning();
    setIsScanning(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 Escanear Código QR</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!isScanning ? (
          <View style={styles.startContainer}>
            <Text style={styles.instructionsText}>
              Presiona el botón para comenzar a escanear el código QR de tu mesa
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartScan}
            >
              <Text style={styles.startButtonText}>Iniciar Escáner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.scannerContainer}>
            {Platform.OS === 'web' ? (
              <div id={scannerId} style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }} />
            ) : (
              <View id={scannerId} style={styles.scannerView} />
            )}
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopScan}
            >
              <Text style={styles.stopButtonText}>Detener Escáner</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startContainer: {
    alignItems: 'center',
    padding: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
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
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scannerView: {
    width: '100%',
    maxWidth: 500,
    height: 300,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
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
  stopButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    maxWidth: '90%',
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default QRScannerView;
