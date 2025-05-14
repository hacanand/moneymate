"use client";

import React, { useState } from "react";
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
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] =
    useState<boolean>(true);

  const handleRegister = (): void => {
    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // In a real app, you would validate and register the user here
    navigation.navigate("Login");
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
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <Surface style={styles.formContainer}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color="gray"
                    />
                  )}
                />
              }
            />

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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={secureConfirmTextEntry}
              right={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name={secureConfirmTextEntry ? "eye" : "eye-off"}
                      size={24}
                      color="gray"
                      onPress={() =>
                        setSecureConfirmTextEntry(!secureConfirmTextEntry)
                      }
                    />
                  )}
                />
              }
              left={
                <TextInput.Icon
                  icon={() => (
                    <MaterialCommunityIcons
                      name="lock-check"
                      size={24}
                      color="gray"
                    />
                  )}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Register
            </Button>

            <View style={styles.loginContainer}>
              <Text>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>Login</Text>
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#2E7D32",
    fontFamily: "Roboto-Medium",
  },
});

export default RegisterScreen;
