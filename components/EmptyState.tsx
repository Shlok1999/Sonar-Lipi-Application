// EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const EmptyState = ({ onCreatePress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Floating Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Image
          style={{ width: 100, height: 100, borderRadius: 50 }}
          source={require('@/assets/images/icon.png')}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text */}
      <Text style={styles.title}>No Compositions Yet</Text>
      <Text style={styles.description}>
        Create your first rhythm composition to get started with Indian classical music.
      </Text>

      {/* Create Button */}
      <TouchableOpacity style={styles.button} onPress={onCreatePress} activeOpacity={0.85}>
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.buttonText}>Create Composition</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: '30%',
    paddingHorizontal: 20,
  },
  iconContainer: {
    backgroundColor: '#C8E6C9', // soft light green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 60,
    padding: 20,
    shadowColor: '#388E3C', // deep green glow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#388E3C', // deep green text
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6D6D8A',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  button: {
    backgroundColor: '#388E3C', // solid deep green
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default EmptyState;
