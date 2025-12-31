import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const DiscountCalculator = ({ visible, onClose, onApply, currentTotal }) => {
  const [display, setDisplay] = useState('0');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('client'); // 'client' o 'employee'

  const handleNumberPress = (num) => {
    if (discountType === 'employee') {
      return; // No permitir entrada manual en modo empleado
    }
    if (display === '0') {
      setDisplay(num.toString());
    } else {
      setDisplay(display + num);
    }
    setDiscount(parseFloat(display + num) || 0);
  };

  const handleDecimalPress = () => {
    if (discountType === 'employee') {
      return; // No permitir entrada manual en modo empleado
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setDiscount(0);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setDiscount(parseFloat(newDisplay) || 0);
    } else {
      setDisplay('0');
      setDiscount(0);
    }
  };

  const handleApply = () => {
    let discountValue = 0;
    if (discountType === 'employee') {
      // Descuento de empleado: 50%
      discountValue = currentTotal * 0.5;
    } else {
      // Descuento de cliente: cantidad ingresada
      discountValue = parseFloat(display) || 0;
    }
    onApply(discountValue);
    handleClear();
    setDiscountType('client');
    onClose();
  };

  const handleEmployeeDiscount = () => {
    setDiscountType('employee');
    const discountValue = currentTotal * 0.5;
    setDisplay(discountValue.toFixed(2));
    setDiscount(discountValue);
  };

  const handleClientDiscount = () => {
    setDiscountType('client');
    setDisplay('0');
    setDiscount(0);
  };

  // Actualizar descuento cuando cambia el tipo o el total
  useEffect(() => {
    if (discountType === 'employee') {
      const employeeDiscount = currentTotal * 0.5;
      setDiscount(employeeDiscount);
      setDisplay(employeeDiscount.toFixed(2));
    }
  }, [discountType, currentTotal]);

  const handlePercentage = () => {
    const percentage = parseFloat(display) || 0;
    const discountValue = (currentTotal * percentage) / 100;
    setDisplay(discountValue.toFixed(2));
    setDiscount(discountValue);
    setDiscountType('client');
  };

  const calculatedTotal = Math.max(0, currentTotal - discount);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Calculadora de Descuento</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.displayContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{currentTotal.toFixed(2)}€</Text>
            </View>
            
            {/* Selector de tipo de descuento */}
            <View style={styles.discountTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.discountTypeButton,
                  discountType === 'client' && styles.discountTypeButtonSelected
                ]}
                onPress={handleClientDiscount}
              >
                <Text style={[
                  styles.discountTypeText,
                  discountType === 'client' && styles.discountTypeTextSelected
                ]}>
                  Cliente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.discountTypeButton,
                  discountType === 'employee' && styles.discountTypeButtonSelected
                ]}
                onPress={handleEmployeeDiscount}
              >
                <Text style={[
                  styles.discountTypeText,
                  discountType === 'employee' && styles.discountTypeTextSelected
                ]}>
                  Empleado (50%)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Descuento:</Text>
              <Text style={styles.discountValue}>-{discount.toFixed(2)}€</Text>
              {discountType === 'employee' && (
                <Text style={styles.discountPercentage}>(50%)</Text>
              )}
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>A Pagar:</Text>
              <Text style={styles.resultValue}>{calculatedTotal.toFixed(2)}€</Text>
            </View>
            {discountType === 'client' && (
              <View style={styles.displayBox}>
                <Text style={styles.displayText}>{display}</Text>
              </View>
            )}
            {discountType === 'employee' && (
              <View style={styles.employeeInfoBox}>
                <Text style={styles.employeeInfoText}>
                  Descuento de empleado aplicado: 50%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              {discountType === 'client' && (
                <>
                  <TouchableOpacity style={[styles.button, styles.functionButton]} onPress={handleClear}>
                    <Text style={styles.buttonText}>C</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.functionButton]} onPress={handleBackspace}>
                    <Text style={styles.buttonText}>⌫</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.functionButton]} onPress={handlePercentage}>
                    <Text style={styles.buttonText}>%</Text>
                  </TouchableOpacity>
                </>
              )}
              {discountType === 'employee' && (
                <View style={styles.employeeButtonPlaceholder} />
              )}
              <TouchableOpacity 
                style={[styles.button, styles.applyButton, discountType === 'employee' && styles.applyButtonEmployee]} 
                onPress={handleApply}
              >
                <Text style={[styles.buttonText, styles.applyButtonText]}>Aplicar</Text>
              </TouchableOpacity>
            </View>
            {discountType === 'client' && (
              <>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('7')}>
                    <Text style={styles.buttonText}>7</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('8')}>
                    <Text style={styles.buttonText}>8</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('9')}>
                    <Text style={styles.buttonText}>9</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.operatorButton]} onPress={() => {
                    const value = parseFloat(display) || 0;
                    setDisplay((currentTotal - value).toFixed(2));
                    setDiscount(value);
                  }}>
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('4')}>
                    <Text style={styles.buttonText}>4</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('5')}>
                    <Text style={styles.buttonText}>5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('6')}>
                    <Text style={styles.buttonText}>6</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.operatorButton]} onPress={() => {
                    const value = parseFloat(display) || 0;
                    setDisplay((currentTotal + value).toFixed(2));
                    setDiscount(-value);
                  }}>
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('1')}>
                    <Text style={styles.buttonText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('2')}>
                    <Text style={styles.buttonText}>2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleNumberPress('3')}>
                    <Text style={styles.buttonText}>3</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.operatorButton]} onPress={() => {
                    setDisplay(currentTotal.toFixed(2));
                    setDiscount(0);
                  }}>
                    <Text style={styles.buttonText}>Total</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.button, styles.zeroButton]} onPress={() => handleNumberPress('0')}>
                    <Text style={styles.buttonText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={handleDecimalPress}>
                    <Text style={styles.buttonText}>.</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.functionButton]} onPress={() => {
                    setDisplay('0');
                    setDiscount(0);
                  }}>
                    <Text style={styles.buttonText}>CE</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            {discountType === 'employee' && (
              <View style={styles.employeeMessageContainer}>
                <Text style={styles.employeeMessageText}>
                  Se aplicará un descuento del 50% automáticamente
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  displayContainer: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFA500',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  discountLabel: {
    fontSize: 16,
    color: '#FFA500',
  },
  discountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  displayBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  displayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'right',
  },
  discountTypeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  discountTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  discountTypeButtonSelected: {
    backgroundColor: '#FFD700',
  },
  discountTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  discountTypeTextSelected: {
    color: '#1A1A1A',
  },
  discountPercentage: {
    fontSize: 12,
    color: '#FFA500',
    marginLeft: 5,
  },
  employeeInfoBox: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginTop: 10,
  },
  employeeInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  employeeButtonPlaceholder: {
    flex: 3,
  },
  applyButtonEmployee: {
    flex: 1,
  },
  employeeMessageContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  employeeMessageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    height: 60,
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  zeroButton: {
    flex: 2,
  },
  functionButton: {
    backgroundColor: '#FFA500',
  },
  operatorButton: {
    backgroundColor: '#4CAF50',
  },
  applyButton: {
    backgroundColor: '#FFD700',
    flex: 2,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  applyButtonText: {
    color: '#1A1A1A',
  },
});

export default DiscountCalculator;

