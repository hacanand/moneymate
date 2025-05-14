"use client";

 
import React,{ useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, Button, Text, Surface, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LocalAuth from "react-native-local-auth";
import * as WebBrowser from "expo-web-browser";
import type * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";

// Required for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  navigation: {
    reset: (params: { index: number; routes: { name: string }[] }) => void;
    navigate: (screen: string) => void;
  };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [isSigninInProgress, setIsSigninInProgress] = useState<boolean>(false);

  // Google Auth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "YOUR_EXPO_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  useEffect(() => {
    // Check if biometric authentication is available
    checkBiometricAvailability();
  }, []);

  // Handle Google Auth response
  useEffect(() => {
    if (response?.type === "success") {
      // Handle successful authentication
      handleGoogleAuthSuccess(response.authentication);
    } else if (response?.type === "error") {
      Alert.alert(
        "Authentication Error",
        response.error?.message || "An error occurred during sign in"
      );
    }
  }, [  response]);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const available = await LocalAuth.hasTouchID();
      setBiometricAvailable(available);
    } catch (error) {
      console.log("Biometric availability check error:", error);
    }
  };

  const handleBiometricLogin = async (): Promise<void> => {
    try {
      const success = await LocalAuth.authenticate({
        reason: "Log in to MoneyMate",
        fallbackToPasscode: true,
        suppressEnterPassword: true,
      });

      if (success) {
        // In a real app, you would validate with your backend here
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    } catch (error) {
      console.log("Authentication error:", error);
      Alert.alert(
        "Authentication Failed",
        "Please try again or use email and password."
      );
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setIsSigninInProgress(true);
      await promptAsync();
    } catch (error) {
      console.log("Google sign-in error:", error);
      Alert.alert("Sign-In Error", "An error occurred during Google sign-in.");
    } finally {
      setIsSigninInProgress(false);
    }
  };

  const handleGoogleAuthSuccess = async (
    authentication: AuthSession.TokenResponse | null
  ): Promise<void> => {
    if (!authentication) return;

    try {
      // Get user info using the access token
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${authentication.accessToken}` },
        }
      );

      const userInfo = await userInfoResponse.json();
      console.log("Google Sign-In successful:", userInfo);

      // In a real app, you would send this token to your backend
      // and handle the authentication there

      // Navigate to Main
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (error) {
      console.log("Error fetching user info:", error);
      Alert.alert("Authentication Error", "Failed to get user information");
    }
  };

  const handleLogin = (): void => {
    // In a real app, you would validate and authenticate here
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>MoneyMate</Text>
            <Text style={styles.tagline}>Manage your loans with ease</Text>
          </View>

          <Surface style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="email"
                      size={24}
                      color="gray"
                    />
                  )}
                />
              }
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={secureTextEntry}
              right={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name={secureTextEntry ? "eye" : "eye-off"}
                      size={24}
                      color="gray"
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                    />
                  )}
                />
              }
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="lock"
                      size={24}
                      color="gray"
                    />
                  )}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Login
            </Button>

            {biometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
              >
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={24}
                  color="#2E7D32"
                />
                <Text style={styles.biometricText}>Login with Fingerprint</Text>
              </TouchableOpacity>
            )}

            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <Divider style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              icon={() => (
                <MaterialCommunityIcons
                  name="google"
                  size={20}
                  color="#DB4437"
                />
              )}
              onPress={handleGoogleSignIn}
              disabled={isSigninInProgress || !request}
              style={styles.googleButton}
              labelStyle={styles.googleButtonLabel}
            >
              Sign in with Google
            </Button>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    color: "#2E7D32",
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: "#757575",
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
    backgroundColor: "#2E7D32",
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    padding: 10,
  },
  biometricText: {
    marginLeft: 10,
    color: "#2E7D32",
    fontFamily: "Roboto-Medium",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#757575",
    fontFamily: "Roboto-Regular",
  },
  googleButton: {
    borderColor: "#DB4437",
    borderWidth: 1,
    paddingVertical: 6,
  },
  googleButtonLabel: {
    color: "#DB4437",
    fontFamily: "Roboto-Medium",
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#2E7D32",
    fontFamily: "Roboto-Regular",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#2E7D32",
    fontFamily: "Roboto-Medium",
  },
});

export default LoginScreen;
