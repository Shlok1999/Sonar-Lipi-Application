import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router'; // Added router import here
import { Feather } from '@expo/vector-icons';

import { loadCompositions } from '@/utils/storage';
import CreateCompositionModal from '@/components/CreateCompositionModal';
import EmptyState from '@/components/EmptyState';

export default function Dashboard() {
  const [compositions, setCompositions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchCompositions();
    }, [])
  );

  const fetchCompositions = async () => {
    setIsLoading(true);
    try {
      const savedCompositions = await loadCompositions();
      setCompositions(savedCompositions);
    } catch (error) {
      console.error('Failed to load compositions:', error);
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.compositionName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.taalBadge}>
          <Text style={styles.taalName}>{item.taal.name}</Text>
        </View>
        <Text style={styles.dateText}>
          Last edited: {new Date(item.lastEdited).toLocaleDateString()}
        </Text>
      </View>
      <Feather name="chevron-right" size={24} color="#6D6D8A" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A45D1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FF" />
      
      {compositions.length > 0 ? (
        <FlatList
          data={compositions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={<Text style={styles.headerTitle}>Your Compositions</Text>}
        />
      ) : (
        <EmptyState onCreatePress={() => setModalVisible(true)} />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="white" />
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
    backgroundColor: '#F5F7FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E2E',
    marginBottom: 16,
    marginTop: 8,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  compositionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  compositionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2E',
    marginBottom: 8,
  },
  taalBadge: {
    backgroundColor: '#E6E9FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  taalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A45D1',
  },
  dateText: {
    fontSize: 13,
    color: '#6D6D8A',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#6A45D1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
});