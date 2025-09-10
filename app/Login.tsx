import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const requestOtp = () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid phone number.");
      return;
    }
    setStep("otp");
    Alert.alert("OTP Sent", "We have sent an OTP to your phone.");
  };

  const verifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter the correct OTP.");
      return;
    }

    // Fake profile (replace with API response later)
    const userProfile = {
      phone: phoneNumber,
      name: "Guest User",
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4CAF50", "#2E7D32"]}
        style={styles.background}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {step === "phone" ? "Login" : "Enter OTP"}
          </Text>

          {step === "phone" ? (
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={step === "phone" ? requestOtp : verifyOtp}
          >
            <Text style={styles.buttonText}>
              {step === "phone" ? "Send OTP" : "Verify OTP"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
