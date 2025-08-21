import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { TAALS } from '@/utils/taals';
import { createComposition } from '@/utils/storage';

const CreateCompositionModal = ({ visible, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [selectedTaal, setSelectedTaal] = useState(null);
  const [nameError, setNameError] = useState('');
  const [taalError, setTaalError] = useState('');

  const resetForm = () => {
    setName('');
    setSelectedTaal(null);
    setNameError('');
    setTaalError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Composition name is required');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!selectedTaal) {
      setTaalError('Please select a taal');
      isValid = false;
    } else {
      setTaalError('');
    }

    return isValid;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const taal = TAALS.find(t => t.id === selectedTaal);

    // Create empty grid with 2 rows based on taal structure
    const emptyGrid = Array(10)
      .fill()
      .map(() => Array(taal.numberOfColumns).fill(''));
    
    const newComposition = await createComposition({
      name: name.trim(),
      taalId: taal.id,
      taal,
      grid: emptyGrid,
    });

    resetForm();
    onSuccess();
    
    // Navigate to the new composition
    router.push(`/composition/${newComposition.id}`);
  };

   return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Composition</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Composition Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter a unique name"
                  placeholderTextColor="#9A9BBD"
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Taal</Text>
                {taalError ? <Text style={styles.errorText}>{taalError}</Text> : null}
                
                <View style={styles.taalListContainer}>
                  {TAALS.map((taal) => (
                    <TouchableOpacity
                      key={taal.id}
                      style={[
                        styles.taalOption,
                        selectedTaal === taal.id && styles.selectedTaal,
                      ]}
                      onPress={() => setSelectedTaal(taal.id)}
                    >
                      <View style={styles.taalInfo}>
                        <Text style={styles.taalName}>{taal.name}</Text>
                        <Text style={styles.taalStructure}>
                          Structure: {taal.structure.join(' + ')}
                        </Text>
                      </View>
                      {selectedTaal === taal.id && (
                        <View style={styles.checkIcon}>
                          <Feather name="check" size={20} color="#6A45D1" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
            >
              <Text style={styles.createButtonText}>Create Composition</Text>
              <Feather name="plus-circle" size={20} color="#fff" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#1E1E2E',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A4A',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E2E2FF',
    letterSpacing: 0.5,
  },
  closeButton: {
    backgroundColor: '#3A3A4A',
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8B8D8',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2A2A3A',
    borderRadius: 12,
    padding: 16,
    color: '#E2E2FF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A3A4A',
  },
  taalList: {
    maxHeight: 180,
    borderRadius: 12,
    marginTop: 8,
  },
  taalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A3A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3A3A4A',
  },
  selectedTaal: {
    borderColor: '#6A45D1',
    backgroundColor: '#2A2A3A',
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  taalInfo: {
    flex: 1,
  },
  taalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E2FF',
    marginBottom: 4,
  },
  taalStructure: {
    fontSize: 14,
    color: '#9A9BBD',
  },
  checkIcon: {
    backgroundColor: '#E2E2FF',
    borderRadius: 10,
    padding: 4,
    marginLeft: 10,
  },
  createButton: {
    backgroundColor: '#6A45D1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  errorText: {
    color: '#FF6B8B',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
});

export default CreateCompositionModal;