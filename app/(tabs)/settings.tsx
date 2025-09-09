import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { clearAllData } from '@/utils/storage';

export default function Settings() {
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all compositions? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All compositions have been deleted.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleClearData}
        >
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Indian Classical Music Composer</Text>
          <Text style={styles.infoVersion}>Version 1.0.0</Text>
          <Text style={styles.infoDescription}>
            Create and edit rhythm-based compositions using traditional taals.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0', // warm background
    padding: 16,
  },
  section: {
    marginBottom: 32,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D63324', // deep red
    marginBottom: 12,
    marginTop: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 94, 58, 0.1)', // soft orange button
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 58, 0.2)', // subtle orange border
  },
  buttonText: {
    color: '#FF5E3A', // bright orange text
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#FFFAF5', // soft card background
    borderRadius: 12,
    padding: 20,
    shadowColor: '#FF5E3A', // orange shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D63324', // deep red
    marginBottom: 8,
  },
  infoVersion: {
    fontSize: 14,
    color: '#FF5E3A', // bright orange
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 14,
    color: '#1E1E2E',
    lineHeight: 20,
  },
});
