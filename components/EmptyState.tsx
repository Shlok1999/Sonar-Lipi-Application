import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const EmptyState = ({ onCreatePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="music" size={48} color="#D4AF37" />
      </View>
      
      <Text style={styles.title}>No Compositions Yet</Text>
      <Text style={styles.description}>
        Create your first rhythm composition to get started with Indian classical music.
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={onCreatePress}
      >
        <Feather name="plus" size={18} color="#FFF8E7" />
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
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF3733',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5E3023',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#5E302399',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#9B2335',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF8E7',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EmptyState;