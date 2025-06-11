"use client";

import { useAuth, useSSO, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomAlert } from "../components/CustomAlert";
import { useTheme } from "../context/ThemeContext";

// Required for OAuth
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [isSigninInProgress, setIsSigninInProgress] = useState<boolean>(false);
  const { theme, isDark } = useTheme();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { getToken } = useAuth();
  // Clerk hooks
  const { isSignedIn, user } = useUser();
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    // Only check for biometric availability, do not trigger authentication here
    checkBiometricAvailability();
    // Remove auto-redirect if signed in, to avoid double navigation and double biometric
    // if (isSignedIn) {
    //   router.replace("/(tabs)");
    // }
  }, []); // Remove isSignedIn from dependency array

  useEffect(() => {
    // If user is signed in, redirect to main app (separate effect, no biometric trigger)
    if (isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [isSignedIn]);

  useEffect(() => {
    // Create user profile when user object becomes available after login
    if (isSignedIn && user?.id) {
      createUserProfileIfNeeded(user);
    }
  }, [isSignedIn, user?.id]);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      const compatible =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      const storedUserId = await SecureStore.getItemAsync("biometric_user_id");
      // Only set biometricAvailable if all checks pass, but do NOT trigger authentication here
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

  // Use Clerk's user object type for type safety
  const createUserProfileIfNeeded = async (user: any) => {
    if (!user?.id) return;

    console.log(
      "Creating user profile for:",
      user.id,
      user.emailAddresses?.[0]?.emailAddress
    );

    try {
      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
          fullName: user?.fullName || undefined,
          imageUrl: user?.imageUrl || undefined,
        }),
      });

      const result = await response.json();
      console.log("User profile creation result:", result);

      if (!response.ok) {
        console.error("Failed to create user profile:", result.error);
      }
    } catch (err) {
      console.warn("User profile creation failed", err);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setIsSigninInProgress(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // Store user ID for biometric login after user object is available
        if (user?.id) {
          await SecureStore.setItemAsync("biometric_user_id", user.id);
          const sessionToken = await getToken();
          if (sessionToken) {
            await SecureStore.setItemAsync("clerk_session_token", sessionToken);
          }
        }
        // Note: User profile creation will be handled by the useEffect hook
        // that listens for changes to isSignedIn and user?.id
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

  // Move all styles to StyleSheet for maintainability and theme support
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 0,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 36,
      marginTop: 24,
    },
    logoSurface: {
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 24,
      borderRadius: 32,
      width: 110,
      height: 110,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    logo: {
      width: 70,
      height: 70,
      borderRadius: 20,
    },
    appName: {
      fontSize: 32,
      fontFamily: "Roboto-Bold",
      color: theme.colors.primary,
      marginTop: 18,
      letterSpacing: 0.5,
    },
    tagline: {
      fontSize: 16,
      fontFamily: "Roboto-Regular",
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
      textAlign: "center",
      maxWidth: 260,
    },
    formContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 28,
      marginHorizontal: 18,
      elevation: 6,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      alignItems: "center",
    },
    googleButton: {
      width: "100%",
      borderRadius: 8,
      marginTop: 8,
      marginBottom: biometricAvailable ? 18 : 0,
      paddingVertical: 6,
      backgroundColor: theme.colors.primary,
    },
    googleButtonLabel: {
      fontSize: 17,
      fontFamily: "Roboto-Medium",
      letterSpacing: 0.2,
      color: "#fff",
    },
    biometricButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: "100%",
      marginTop: 0,
    },
    biometricText: {
      marginLeft: 12,
      fontFamily: "Roboto-Medium",
      color: theme.colors.primary,
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Surface style={styles.logoSurface}>
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </Surface>
            <Text style={styles.appName}>MoneyMate</Text>
            <Text style={styles.tagline}>
              Manage your rupee loans with ease
            </Text>
          </View>

          <Surface style={styles.formContainer}>
            <Button
              mode="contained"
              icon={() => (
                <MaterialCommunityIcons name="google" size={22} color="#fff" />
              )}
              onPress={handleGoogleSignIn}
              disabled={isSigninInProgress}
              style={styles.googleButton}
              labelStyle={styles.googleButtonLabel}
              contentStyle={{ height: 50 }}
              accessibilityLabel="Sign in with Google"
            >
              Sign in with Google
            </Button>

            {biometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                activeOpacity={0.85}
                accessibilityLabel="Login with Fingerprint"
              >
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.biometricText}>Login with Fingerprint</Text>
              </TouchableOpacity>
            )}
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
      <AlertComponent />
    </SafeAreaView>
  );
}
