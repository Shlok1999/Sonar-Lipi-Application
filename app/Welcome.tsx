import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState<null | boolean>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  // Check login state on component mount
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const profile = await AsyncStorage.getItem("userProfile");
        setHasProfile(!!profile);
      } catch (e) {
        console.error("Failed to check user profile", e);
        setHasProfile(false);
      }
    };
    checkUserProfile();
  }, []);

  // Animation effects
  useEffect(() => {
    // Logo animation sequence
    Animated.parallel([
      // Fade and slide up for text
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Logo scale animation
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      // Logo rotation animation
      Animated.loop(
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        })
      )
    ]).start();
  }, [fadeAnim, slideUpAnim, logoScale, logoRotate]);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleGetStarted = () => {
    if (hasProfile) {
      // User is already logged in, go directly to index
      router.replace("/(tabs)");
    } else {
      // User needs to login
      router.push("/Login");
    }
  };

  return (
    <View style={styles.container}>
      {/* Background with gradient */}
      <LinearGradient 
        colors={["#E7F1F9", "#FFFFFF"]} 
        style={styles.background}
      />
      
      {/* Decorative elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      
      {/* Welcome text at the top */}
      <Animated.View 
        style={[styles.welcomeTextContainer, { 
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }]}
      >
        <Text style={styles.welcomeText}>Welcome to</Text>
      </Animated.View>

      {/* Animated Logo in center */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            transform: [
              { scale: logoScale },
              { rotate: rotateInterpolate }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={["#4CAF50", "#66BB6A"]} // Green gradient
          style={styles.logoBackground}
        >
          <Image 
            source={require("../assets/images/PAAVAMAI__3_-removebg-preview.png")} 
            style={styles.logoImage} 
          />
        </LinearGradient>
      </Animated.View>

      {/* App name */}
      <Animated.View 
        style={[styles.appNameContainer, { 
          opacity: fadeAnim,
        }]}
      >
        <Text style={styles.appName}>Sonar Lipi</Text>
      </Animated.View>

      {/* Get Started button at bottom */}
      <Animated.View 
        style={[styles.buttonContainer, { 
          opacity: fadeAnim,
        }]}
      >
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {hasProfile ? "Continue" : "Get Started"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E7F1F9",
    paddingVertical: 60,
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(76, 175, 80, 0.1)", // Green with opacity
    top: -100,
    right: -100,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(38, 52, 79, 0.05)",
    bottom: -50,
    left: -50,
  },
  welcomeTextContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 22,
    color: "#7B8387",
    fontFamily: "System",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoBackground: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50", // Green shadow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    tintColor: "#FFFFFF",
  },
  appNameContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#26344F",
    fontFamily: "System",
    letterSpacing: 1,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#4CAF50", // Green button
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50", // Green shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "System",
  },
});