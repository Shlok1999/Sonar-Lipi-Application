import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(height * 0.3)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animations
    const floating = (anim: Animated.Value, delay: number, distance: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -distance,
            duration: 4000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: distance,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    floating(float1, 0, 15);
    floating(float2, 2000, 20);
    floating(float3, 1000, 18);
    floating(float4, 3000, 22);

    // Form entrance animation
    Animated.parallel([
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sendOtp = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Invalid Phone Number", "Please enter a 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsOtpSent(true);
      setIsLoading(false);
      Alert.alert("OTP Sent", `A verification code has been sent to ${phoneNumber}.`);
    }, 1500);
  };

  const verifyOtp = async () => {
    if (otp === "123456") {
      setIsLoading(true);
      try {
        await AsyncStorage.setItem("isLoggedIn", "true");
        router.replace("/(tabs)");
      } catch (e) {
        Alert.alert("Login Failed", "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Invalid OTP", "Please enter the correct OTP.");
    }
  };

  return (
    <LinearGradient colors={["#E7F1F9", "#FFFFFF"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {/* Background decorative elements */}
        <View style={styles.backgroundElements}>
          <Animated.View
            style={[
              styles.decorCircle,
              styles.circle1,
              { transform: [{ translateY: float1 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.decorCircle,
              styles.circle2,
              { transform: [{ translateY: float2 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.decorCircle,
              styles.circle3,
              { transform: [{ translateY: float3 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.decorCircle,
              styles.circle4,
              { transform: [{ translateY: float4 }] },
            ]}
          />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <Animated.View 
            style={[
              styles.container, 
              { 
                opacity: formFade,
                transform: [{ translateY: formSlide }] 
              }
            ]}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#4CAF50", "#66BB6A"]} // Green gradient
                style={styles.logoBackground}
              >
                <Image 
                  source={require("../assets/images/PAAVAMAI__3_-removebg-preview.png")} 
                  style={styles.logoImage} 
                />
              </LinearGradient>
            </View>

            <Text style={styles.title}>
              {isOtpSent ? "Verify OTP" : "Welcome Back"}
            </Text>
            <Text style={styles.subtitle}>
              {isOtpSent
                ? "Enter the code sent to your phone"
                : "Sign in to continue to Sonar Lipi"}
            </Text>

            {!isOtpSent ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your 10-digit number"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholderTextColor="#7B8387"
                />
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  placeholderTextColor="#7B8387"
                />
              </View>
            )}

            {isLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 30 }} />
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={isOtpSent ? verifyOtp : sendOtp}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4CAF50", "#66BB6A"]} // Green gradient
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {isOtpSent ? "Verify & Login" : "Send OTP"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isOtpSent && (
              <TouchableOpacity 
                style={styles.resendContainer}
                onPress={sendOtp}
              >
                <Text style={styles.resendText}>
                  Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "center",
  },
  backgroundElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(76, 175, 80, 0.1)", // Green with opacity
  },
  circle1: {
    width: 120,
    height: 120,
    top: "15%",
    left: "10%",
  },
  circle2: {
    width: 80,
    height: 80,
    top: "65%",
    right: "15%",
    backgroundColor: "rgba(38, 52, 79, 0.08)",
  },
  circle3: {
    width: 60,
    height: 60,
    bottom: "20%",
    left: "20%",
    backgroundColor: "rgba(123, 131, 135, 0.1)",
  },
  circle4: {
    width: 100,
    height: 100,
    top: "30%",
    right: "25%",
    backgroundColor: "rgba(76, 175, 80, 0.15)", // Green with opacity
  },
  container: {
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    borderRadius: 24,
    shadowColor: "#26344F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50", // Green shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    tintColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#26344F",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 15,
    color: "#7B8387",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "System",
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#26344F",
    marginBottom: 8,
    fontFamily: "System",
  },
  input: {
    width: "100%",
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E7F1F9",
    color: "#26344F",
    fontFamily: "System",
  },
  button: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#4CAF50", // Green shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "System",
  },
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    color: "#7B8387",
    fontSize: 14,
    fontFamily: "System",
  },
  resendLink: {
    color: "#4CAF50", // Green color
    fontWeight: "600",
  },
});