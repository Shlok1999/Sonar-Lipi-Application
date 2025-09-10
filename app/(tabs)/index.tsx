import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { loadCompositions } from '@/utils/storage';
import CreateCompositionModal from '@/components/CreateCompositionModal';
import EmptyState from '@/components/EmptyState';

const { width, height: screenHeight } = Dimensions.get('window');

export default function Dashboard() {
  const [compositions, setCompositions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnim = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -20,
            duration: 3000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 20,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    loopAnim(floatAnim1, 0);
    loopAnim(floatAnim2, 1500);
  }, []);

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

  const handleCompositionPress = (id: string) => {
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
        <Text style={styles.compositionName} numberOfLines={1}>
          {item.name}
        </Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Floating animated circles */}
        <Animated.View
          style={[
            styles.circle,
            { top: 100, left: 30, transform: [{ translateY: floatAnim1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.circleSecondary,
            { bottom: 150, right: 50, transform: [{ translateY: floatAnim2 }] },
          ]}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : compositions.length > 0 ? (
          <FlatList
            data={compositions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // white background
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.select({
      android: 16,
      ios: 0,
    }),
  },
  circle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // soft green
    zIndex: -1,
  },
  circleSecondary: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(129, 199, 132, 0.15)', // lighter green
    zIndex: -1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
    paddingBottom: Platform.select({
      android: 80,
      ios: 80,
    }),
  },
  compositionCard: {
    backgroundColor: '#F1F8F3', // light green cream
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  compositionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32', // strong green
    marginBottom: 8,
  },
  taalBadge: {
    backgroundColor: '#C8E6C9', // light green badge
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  taalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#388E3C', // deep green
  },
  dateText: {
    fontSize: 13,
    color: '#66BB6A', // muted green
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.select({
      android: 60 + (StatusBar.currentHeight ?? 24),
      ios: 24,
    }),
    backgroundColor: '#388E3C', // deep green FAB
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 10,
  },
});
