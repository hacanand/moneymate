import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

const AuthGate: React.FC = () => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const biometricEnabled = await SecureStore.getItemAsync(
          "biometric_enabled"
        );
        if (biometricEnabled === "true") {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to access MoneyMate",
            fallbackLabel: "Use Passcode",
            disableDeviceFallback: false,
          });
          if (result.success) {
            router.replace("/(tabs)");
          } else {
            Alert.alert(
              "Authentication Required",
              "Biometric authentication failed. Please try again.",
              [
                { text: "Retry", onPress: () => router.replace("/auth-gate") },
                { text: "Logout", onPress: () => router.replace("/") },
              ]
            );
          }
        } else {
          router.replace("/(tabs)");
        }
      } catch (e) {
        router.replace("/(tabs)");
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default AuthGate;
