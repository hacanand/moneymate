"use client";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modalbox";
import {
  Avatar,
  Button,
  Divider,
  List,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ProfileScreenNavigationProp } from "../../types/navigation";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProfileScreen: React.FC<ProfileScreenNavigationProp> = ({
  navigation,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Modal references
  const passwordModalRef = useRef<any>(null);
  const aboutModalRef = useRef<any>(null);

  useEffect(() => {
    // Check if biometric authentication is available
    checkBiometricAvailability();

    // Check if user is signed in with Google
    checkGoogleSignIn();
  }, []);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(available && enrolled);
    } catch (error) {
      console.log("Biometric availability check error:", error);
    }
  };

  const checkGoogleSignIn = async (): Promise<void> => {
    try {
      // Check if we have a Google auth token in secure storage
      const googleToken = await SecureStore.getItemAsync("google_auth_token");
      setIsGoogleSignedIn(!!googleToken);
    } catch (error) {
      console.log("Google sign-in check error:", error);
    }
  };

  const onToggleNotifications = (): void =>
    setNotificationsEnabled(!notificationsEnabled);

  const onToggleBiometric = async (): Promise<void> => {
    if (!biometricAvailable) {
      Alert.alert(
        "Not Available",
        "Biometric authentication is not available on this device."
      );
      return;
    }

    if (!biometricEnabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Verify your identity to enable biometric login",
          fallbackLabel: "Use Passcode",
          disableDeviceFallback: false,
        });

        if (result.success) {
          setBiometricEnabled(true);
          Alert.alert("Success", "Biometric login has been enabled.");
        }
      } catch (error) {
        console.log("Authentication error:", error);
        Alert.alert(
          "Authentication Failed",
          "Could not enable biometric login."
        );
      }
    } else {
      setBiometricEnabled(false);
      Alert.alert("Disabled", "Biometric login has been disabled.");
    }
  };

  const onToggleDarkMode = (): void => setDarkModeEnabled(!darkModeEnabled);

  const handleChangePassword = (): void => {
    // Validate passwords
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }

    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    // In a real app, you would validate and change the password here
    Alert.alert("Success", "Your password has been updated.");
    setPasswordModalOpen(false);
    resetPasswordForm();
  };

  const resetPasswordForm = (): void => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleGoogleSignOut = async (): Promise<void> => {
    try {
      // Remove Google auth token from secure storage
      await SecureStore.deleteItemAsync("google_auth_token");
      setIsGoogleSignedIn(false);
      Alert.alert("Success", "You have been signed out from Google.");
    } catch (error) {
      console.log("Google sign out error:", error);
      Alert.alert("Error", "Failed to sign out from Google.");
    }
  };

  const handleLogout = async (): Promise<void> => {
    // Sign out from Google if signed in
    if (isGoogleSignedIn) {
      try {
        await SecureStore.deleteItemAsync("google_auth_token");
      } catch (error) {
        console.log("Google sign out error:", error);
      }
    }

    // In a real app, you would handle logout here
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <View style={styles.header}>
        <Avatar.Image
          size={100}
          source={require("../../assets/images/icon.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>Alex Johnson</Text>
        <Text style={styles.email}>alex.johnson@example.com</Text>
        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.editProfileButton}
        >
          Edit Profile
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <List.Item
          title="Change Password"
          left={(props) => (
            <MaterialCommunityIcons name="lock" size={24} color="#757575" />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#757575"
            />
          )}
          onPress={() => setPasswordModalOpen(true)}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider />
        <List.Item
          title="Notifications"
          left={(props) => (
            <MaterialCommunityIcons name="bell" size={24} color="#757575" />
          )}
          right={(props) => (
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
            />
          )}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider />
        {biometricAvailable && (
          <>
            <List.Item
              title="Biometric Authentication"
              left={(props) => (
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={24}
                  color="#757575"
                />
              )}
              right={(props) => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={onToggleBiometric}
                />
              )}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
            />
            <Divider />
          </>
        )}
        <List.Item
          title="Dark Mode"
          left={(props) => (
            <MaterialCommunityIcons
              name="theme-light-dark"
              size={24}
              color="#757575"
            />
          )}
          right={(props) => (
            <Switch value={darkModeEnabled} onValueChange={onToggleDarkMode} />
          )}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
      </View>

      {isGoogleSignedIn && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          <List.Item
            title="Google Account"
            description="Connected"
            left={(props) => (
              <MaterialCommunityIcons name="google" size={24} color="#757575" />
            )}
            right={(props) => (
              <Button mode="text" onPress={handleGoogleSignOut} color="#F44336">
                Disconnect
              </Button>
            )}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <List.Item
          title="About MoneyMate"
          left={(props) => (
            <MaterialCommunityIcons
              name="information"
              size={24}
              color="#757575"
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#757575"
            />
          )}
          onPress={() => setAboutModalOpen(true)}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider />
        <List.Item
          title="Help & Support"
          left={(props) => (
            <MaterialCommunityIcons
              name="help-circle"
              size={24}
              color="#757575"
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#757575"
            />
          )}
          onPress={() => {}}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider />
        <List.Item
          title="Privacy Policy"
          left={(props) => (
            <MaterialCommunityIcons name="shield" size={24} color="#757575" />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#757575"
            />
          )}
          onPress={() => {}}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider />
        <List.Item
          title="Terms of Service"
          left={(props) => (
            <MaterialCommunityIcons
              name="file-document"
              size={24}
              color="#757575"
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#757575"
            />
          )}
          onPress={() => {}}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
      </View>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="logout" size={size} color={color} />
        )}
      >
        Logout
      </Button>

      {/* Password Change Modal */}
      <Modal
        ref={passwordModalRef}
        style={styles.modal}
        position="center"
        isOpen={passwordModalOpen}
        onClosed={() => setPasswordModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TouchableOpacity onPress={() => setPasswordModalOpen(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setPasswordModalOpen(false)}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleChangePassword}
            style={styles.saveButton}
          >
            Save
          </Button>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        ref={aboutModalRef}
        style={styles.aboutModal}
        position="center"
        isOpen={aboutModalOpen}
        onClosed={() => setAboutModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>About MoneyMate</Text>
          <TouchableOpacity onPress={() => setAboutModalOpen(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.aboutContent}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={64}
              color="#2E7D32"
            />
            <Text style={styles.appName}>MoneyMate</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          <Text style={styles.aboutText}>
            MoneyMate is a comprehensive loan management app designed for
            lenders to track loans, manage borrowers, and monitor repayments.
          </Text>

          <Text style={styles.aboutText}>
            With MoneyMate, you can create and manage loans, track payments,
            send reminders, and generate reports.
          </Text>

          <Text style={styles.copyright}>
            © 2025 MoneyMate. All rights reserved.
          </Text>
        </View>

        <Button
          mode="outlined"
          onPress={() => setAboutModalOpen(false)}
          style={styles.closeButton}
        >
          Close
        </Button>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
  },
  email: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: "#757575",
    marginBottom: 16,
  },
  editProfileButton: {
    borderColor: "#2E7D32",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemTitle: {
    fontFamily: "Roboto-Regular",
  },
  logoutButton: {
    margin: 24,
    borderColor: "#F44336",
    borderWidth: 1,
  },
  modal: {
    height: 320,
    width: SCREEN_WIDTH - 40,
    borderRadius: 20,
    padding: 20,
  },
  aboutModal: {
    height: 400,
    width: SCREEN_WIDTH - 40,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },
  modalContent: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#2E7D32",
  },
  aboutContent: {
    flex: 1,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
    color: "#2E7D32",
    marginTop: 8,
  },
  version: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    color: "#757575",
    marginTop: 4,
  },
  aboutText: {
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  copyright: {
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    color: "#757575",
    marginTop: 20,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
  },
});

export default ProfileScreen;
