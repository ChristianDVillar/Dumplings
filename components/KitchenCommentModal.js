import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../utils/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const KitchenCommentModal = ({ visible, onClose, tableNumber, timestamp, currentComment, onSave }) => {
  const [comment, setComment] = useState('');
  const { language } = useAppContext();
  const t = useTranslations(language);

  useEffect(() => {
    if (visible) {
      setComment(currentComment || '');
    }
  }, [visible, currentComment]);

  const handleSave = () => {
    onSave(tableNumber, timestamp, comment.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isMobile && styles.modalContentMobile]}>
          <Text style={styles.modalTitle}>
            {t.comments.title}
          </Text>
          <Text style={styles.modalSubtitle}>
            {t.comments.subtitle(tableNumber, timestamp ? new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '')}
          </Text>

          <TextInput
            style={[styles.commentInput, isMobile && styles.commentInputMobile]}
            placeholder={t.comments.placeholder}
            placeholderTextColor="#999"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.charCount}>
            {t.comments.characters(comment.length, 200)}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t.common.save}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    borderWidth: 2,
    borderColor: '#FFD700',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  modalContentMobile: {
    padding: 16,
    maxWidth: '100%',
  },
  modalTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: isMobile ? 14 : 16,
    color: '#FFA500',
    marginBottom: 20,
    textAlign: 'center',
  },
  commentInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    minHeight: 120,
    marginBottom: 8,
  },
  commentInputMobile: {
    fontSize: 14,
    minHeight: 100,
    padding: 10,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  cancelButton: {
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#45A049',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
  },
});

export default KitchenCommentModal;

