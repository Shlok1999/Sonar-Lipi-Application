import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [userProfile, hasSeenWelcome] = await Promise.all([
          AsyncStorage.getItem('userProfile'),
          AsyncStorage.getItem('hasSeenWelcome')
        ]);

        // Reset initialization state if needed
        if (!hasSeenWelcome) {
          await AsyncStorage.setItem('hasSeenWelcome', 'false');
        }

        // Clear AsyncStorage for testing (remove in production)
        // await AsyncStorage.clear();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={loadingStyles.container}>
        {/* Decorative circles */}
        <View style={[loadingStyles.decorCircle, loadingStyles.circle1]} />
        <View style={[loadingStyles.decorCircle, loadingStyles.circle2]} />
        <View style={[loadingStyles.decorCircle, loadingStyles.circle3]} />
        <View style={[loadingStyles.decorCircle, loadingStyles.circle4]} />
        
        {/* App Logo/Icon */}
        <View style={loadingStyles.logoContainer}>
          <View style={loadingStyles.logoBackground}>
            <Text style={loadingStyles.logoText}>SL</Text>
          </View>
        </View>
        
        {/* App Name */}
        <Text style={loadingStyles.appName}>Sonar Lipi</Text>
        
        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            presentation: 'card',
            gestureEnabled: false
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7F1F9",
    justifyContent: "center",
    alignItems: "center",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(76, 175, 80, 0.1)", // Soft green
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
    backgroundColor: "rgba(38, 52, 79, 0.08)",
  },
  circle3: {
    width: 60,
    height: 60,
    bottom: height * 0.2,
    left: width * 0.2,
    backgroundColor: "rgba(123, 131, 135, 0.1)",
  },
  circle4: {
    width: 100,
    height: 100,
    top: height * 0.3,
    right: width * 0.25,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 40,
    letterSpacing: 1,
  },
});
