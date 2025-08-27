import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<null | boolean>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('isLoggedIn');
        setIsLoggedIn(status === 'true');
      } catch (e) {
        console.error('Failed to check login status', e);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={loadingStyles.container}>
        {/* Decorative circles */}
        <View style={[loadingStyles.decorCircle, loadingStyles.circle1]} />
        <View style={[loadingStyles.decorCircle, loadingStyles.circle2]} />
        <View style={[loadingStyles.decorCircle, loadingStyles.circle3]} />
        <View style={[loadingStyles.decorCircle, loadingStyles.circle4]} />

        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {isLoggedIn ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          [
            <Stack.Screen
              key="Welcome"
              name="Welcome"
              options={{ headerShown: false }}
            />,
            <Stack.Screen
              key="Login"
              name="Login"
              options={{ headerShown: false }}
            />,
          ]
        )}
      </Stack>
    </SafeAreaProvider>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Soft green
  },
  circle1: {
    width: 120,
    height: 120,
    top: height * 0.15,
    left: width * 0.1,
  },
  circle2: {
    width: 80,
    height: 80,
    top: height * 0.65,
    right: width * 0.15,
    backgroundColor: 'rgba(38, 52, 79, 0.08)',
  },
  circle3: {
    width: 60,
    height: 60,
    bottom: height * 0.2,
    left: width * 0.2,
    backgroundColor: 'rgba(123, 131, 135, 0.1)',
  },
  circle4: {
    width: 100,
    height: 100,
    top: height * 0.3,
    right: width * 0.25,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
});
