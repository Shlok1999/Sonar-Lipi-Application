import React, { useRef, useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, View, Animated, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Animated Tab Icon
function AnimatedIcon({ focused, name, size, color }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.15 : 1,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: focused ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  return (
    <Animated.View
      style={[
        focused ? styles.activeIconContainer : styles.iconContainer,
        { transform: [{ scale }, { rotate: spin }] },
      ]}
    >
      <Feather name={name} size={size} color={focused ? '#FFFFFF' : color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        router.replace('/Welcome');
      }
    } catch (error) {
      console.error('Error checking welcome status:', error);
    }
    setIsReady(true);
  };

  if (!isReady) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#388E3C',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarStyle: {
          backgroundColor: '#C8E6C9',
          paddingBottom: Platform.OS === 'android' ? 8 : 20, // ✅ avoids overlap
          paddingTop: Platform.OS === 'android' ? 8 : 20,
          elevation: 6,
          shadowColor: '#81C784',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
      }}
    >

      {/* <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name="user" size={size} color={color} focused={focused} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name="music" size={size} color={color} focused={focused} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name="settings" size={size} color={color} focused={focused} />
          ),
        }}
      />

      

      
    </Tabs>
    
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
  },
  activeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    backgroundColor: '#388E3C',
    borderRadius: 21,
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
