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
    
    // Create empty grid with 4 rows based on taal structure
    const emptyGrid = Array(4)
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
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Composition</Text>
              <TouchableOpacity onPress={handleClose}>
                <Feather name="x" size={24} color="#5E3023" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Composition Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter a unique name"
                placeholderTextColor="#5E302366"
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Taal</Text>
              {taalError ? <Text style={styles.errorText}>{taalError}</Text> : null}
              
              <ScrollView style={styles.taalList}>
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
                      <Feather name="check" size={20} color="#D4AF37" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
            >
              <Text style={styles.createButtonText}>Create Composition</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5E3023',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5E3023',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D4AF3744',
    color: '#5E3023',
  },
  taalList: {
    maxHeight: 200,
  },
  taalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4AF3744',
  },
  selectedTaal: {
    borderColor: '#D4AF37',
    borderWidth: 2,
    backgroundColor: '#FFF8E7',
  },
  taalInfo: {
    flex: 1,
  },
  taalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5E3023',
    marginBottom: 2,
  },
  taalStructure: {
    fontSize: 14,
    color: '#9B2335',
  },
  createButton: {
    backgroundColor: '#9B2335',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    marginTop: 4,
  },
});

export default CreateCompositionModal;