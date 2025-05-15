"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useAuth, useOAuth, useSSO, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { useThemedAlert } from "../components/ThemedAlert";

// Required for OAuth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [isSigninInProgress, setIsSigninInProgress] = useState<boolean>(false);
  const { theme, isDark } = useTheme();
  const { showAlert } = useThemedAlert();

  // Clerk hooks
    const { isSignedIn, user } = useUser();
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    // Check if biometric authentication is available
    checkBiometricAvailability();

    // If user is already signed in, redirect to main app
    if (isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [isSignedIn]);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      const compatible =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      // Also check if we have stored biometric credentials
      const storedUserId = await SecureStore.getItemAsync("biometric_user_id");

      setBiometricAvailable(
        available && compatible.length > 0 && !!storedUserId
      );
    } catch (error) {
      console.log("Biometric availability check error:", error);
    }
  };

  const handleBiometricLogin = async (): Promise<void> => {
    try {
      // Check if we have a stored user ID for biometric login
      const storedUserId = await SecureStore.getItemAsync("biometric_user_id");

      if (!storedUserId) {
        showAlert({
          title: "Biometric Login Not Set Up",
          message:
            "Please sign in with Google first to enable biometric login.",
        });
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Log in to MoneyMate",
        fallbackLabel: "Use passcode",
      });

      if (result.success) {
        try {
          // This is a simplified approach - in a real app, you'd need to implement
          // a more secure way to handle session tokens for biometric auth
          const sessionToken = await SecureStore.getItemAsync(
            "clerk_session_token"
          );
          if (sessionToken) {
            // In a real app, you would validate this token with Clerk
            // For now, we'll just navigate to the main app
            router.replace("/(tabs)");
          } else {
            showAlert({
              title: "Session Expired",
              message: "Please sign in with Google again.",
            });
          }
        } catch (error) {
          console.error("Error signing in with biometrics:", error);
          showAlert({
            title: "Authentication Failed",
            message: "Please sign in with Google.",
          });
        }
      }
    } catch (error) {
      console.log("Authentication error:", error);
      showAlert({
        title: "Authentication Failed",
        message: "Please try again or use Google sign-in.",
      });
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setIsSigninInProgress(true);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (createdSessionId && setActive) {
        // If we have a session, set it as active
        await setActive({ session: createdSessionId });

        // Store user ID for biometric login
        if (user?.id) {
          await SecureStore.setItemAsync("biometric_user_id", user.id);

          // In a real app, you'd need a more secure way to handle this
            // This is just a simplified example
         const { getToken } = useAuth();
          const sessionToken = await getToken();
          if (sessionToken) {
            await SecureStore.setItemAsync("clerk_session_token", sessionToken);
          }
        }

        router.replace("/(tabs)");
      }
    } catch (error) {
      console.log("Google sign-in error:", error);
      showAlert({
        title: "Sign-In Error",
        message: "An error occurred during Google sign-in.",
      });
    } finally {
      setIsSigninInProgress(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: theme.colors.primary }]}>
              MoneyMate
            </Text>
            <Text
              style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}
            >
              Manage your loans with ease
            </Text>
          </View>

          <Surface
            style={[
              styles.formContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Button
              mode="contained"
              icon={() => (
                <MaterialCommunityIcons
                  name="google"
                  size={20}
                  color="#FFFFFF"
                />
              )}
              onPress={handleGoogleSignIn}
              disabled={isSigninInProgress}
              style={styles.googleButton}
              labelStyle={styles.googleButtonLabel}
            >
              Sign in with Google
            </Button>

            {biometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
              >
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.biometricText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Login with Fingerprint
                </Text>
              </TouchableOpacity>
            )}
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    alignItems: "center",
  },
  googleButton: {
    width: "100%",
    paddingVertical: 8,
    marginTop: 20,
  },
  googleButtonLabel: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 10,
  },
  biometricText: {
    marginLeft: 10,
    fontFamily: "Roboto-Medium",
  },
});
