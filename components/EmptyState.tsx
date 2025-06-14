import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const EmptyState = ({ onCreatePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="music" size={48} color="#6A45D1" />
      </View>
      
      <Text style={styles.title}>No Compositions Yet</Text>
      <Text style={styles.description}>
        Create your first rhythm composition to get started with Indian classical music.
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={onCreatePress}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.buttonText}>Create Composition</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F7FF',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6E9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E2E',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#6D6D8A',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#6A45D1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
});

export default EmptyState;