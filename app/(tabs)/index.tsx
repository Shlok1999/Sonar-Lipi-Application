import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { loadCompositions } from '@/utils/storage';
import CreateCompositionModal from '@/components/CreateCompositionModal';
import EmptyState from '@/components/EmptyState';

export default function Dashboard() {
  const [compositions, setCompositions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompositions();
  }, []);

  const fetchCompositions = async () => {
    setIsLoading(true);
    const savedCompositions = await loadCompositions();
    setCompositions(savedCompositions);
    setIsLoading(false);
  };

  const handleCompositionPress = (id) => {
    router.push(`/composition/${id}`);
  };

  const handleCreateSuccess = () => {
    setModalVisible(false);
    fetchCompositions();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.compositionCard}
      onPress={() => handleCompositionPress(item.id)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.compositionName}>{item.name}</Text>
        <Text style={styles.taalName}>{item.taal.name}</Text>
        <Text style={styles.dateText}>
          Last edited: {new Date(item.lastEdited).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <Feather name="chevron-right" size={24} color="#5E3023" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {compositions.length === 0 && !isLoading ? (
        <EmptyState onCreatePress={() => setModalVisible(true)} />
      ) : (
        <FlatList
          data={compositions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={24} color="#FFF8E7" />
      </TouchableOpacity>

      <CreateCompositionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  listContainer: {
    padding: 16,
  },
  compositionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  cardContent: {
    flex: 1,
  },
  compositionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5E3023',
    marginBottom: 4,
  },
  taalName: {
    fontSize: 16,
    color: '#9B2335',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#5E3023AA',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#9B2335',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});