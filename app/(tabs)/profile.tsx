"use client";

import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Avatar,
  Button,
  Divider,
  List,
  Switch,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal from "react-native-modalbox";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useTheme } from "../../context/ThemeContext";
// Import the useCustomAlert hook
import { useCustomAlert } from "../../components/CustomAlert";

// Get screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Theme context
  const { theme, isDark, toggleTheme } = useTheme();
  const { getToken } = useAuth();
  // Clerk hooks
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isAuthLoaded, signOut } = useAuth();

  // Modal references
  const aboutModalRef = useRef<any>(null);

  // Add this line near the top of the component, after other hooks
  const { showAlert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    // Check if biometric authentication is available
    checkBiometricAvailability();

    // Check if biometric login is enabled
    checkBiometricEnabled();
  }, []);

  const checkBiometricAvailability = async (): Promise<void> => {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      const compatible =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      setBiometricAvailable(available && compatible.length > 0);
    } catch (error) {
      console.log("Biometric availability check error:", error);
    }
  };

  const checkBiometricEnabled = async (): Promise<void> => {
    try {
      const storedUserId = await SecureStore.getItemAsync("biometric_user_id");
      setBiometricEnabled(!!storedUserId);
    } catch (error) {
      console.log("Error checking biometric status:", error);
    }
  };

  const onToggleNotifications = (): void =>
    setNotificationsEnabled(!notificationsEnabled);

  const onToggleBiometric = async (): Promise<void> => {
    if (!biometricAvailable) {
      showAlert({
        title: "Not Available",
        message: "Biometric authentication is not available on this device.",
      });
      return;
    }

    if (!biometricEnabled) {
      // Verify user's identity before enabling biometric login
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Verify your identity to enable biometric login",
          fallbackLabel: "Use passcode",
        });

        if (result.success) {
          // Store user ID for biometric login
          if (user?.id) {
            await SecureStore.setItemAsync("biometric_user_id", user.id);

            // Store session token (in a real app, use a more secure approach)
            const sessionToken = await getToken();
            if (sessionToken) {
              await SecureStore.setItemAsync(
                "clerk_session_token",
                sessionToken
              );
            }

            setBiometricEnabled(true);
            showAlert({
              title: "Success",
              message: "Biometric login has been enabled.",
            });
          } else {
            showAlert({
              title: "Error",
              message:
                "User information not available. Please try again later.",
            });
          }
        }
      } catch (error) {
        console.log("Authentication error:", error);
        showAlert({
          title: "Authentication Failed",
          message: "Could not enable biometric login.",
        });
      }
    } else {
      // Disable biometric login
      await SecureStore.deleteItemAsync("biometric_user_id");
      await SecureStore.deleteItemAsync("clerk_session_token");
      setBiometricEnabled(false);
      showAlert({
        title: "Disabled",
        message: "Biometric login has been disabled.",
      });
    }
  };

  const handleLogout = async (): Promise<void> => {
    if (!isAuthLoaded) return;

    try {
      await signOut();
      // Clear biometric login data
      await SecureStore.deleteItemAsync("biometric_user_id");
      await SecureStore.deleteItemAsync("clerk_session_token");

      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
      showAlert({
        title: "Error",
        message: "Failed to sign out. Please try again.",
      });
    }
  };

  // Get user info from Clerk
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || "No email available";
  const userName = user?.fullName || user?.firstName || "User";
  const userImageUrl = user?.imageUrl;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        {userImageUrl ? (
          <Avatar.Image
            size={100}
            source={{ uri: userImageUrl }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Image
            size={100}
            source={require("@/assets/images/icon.png")}
            style={styles.avatar}
          />
        )}
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>
          {userName}
        </Text>
        <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
          {userEmail}
        </Text>
        <Button
          mode="outlined"
          onPress={() => {
            // In a real app, you might redirect to Clerk's user profile page
            showAlert({
              title: "Profile Management",
              message:
                "Profile editing is managed through Clerk's user portal.",
            });
          }}
          style={[
            styles.editProfileButton,
            { borderColor: theme.colors.primary },
          ]}
          textColor={theme.colors.primary}
        >
          Edit Profile
        </Button>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
            },
          ]}
        >
          Account Settings
        </Text>
        <List.Item
          title="Manage Google Account"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <MaterialCommunityIcons
              name="google"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {
            showAlert({
              title: "Google Account",
              message:
                "To manage your Google account settings, please visit your Google account page.",
              buttons: [
                {
                  text: "OK",
                  style: "default",
                },
              ],
            });
          }}
          style={styles.listItem}
        />
        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
        <List.Item
          title="Notifications"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <MaterialCommunityIcons
              name="bell"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              color={theme.colors.primary}
            />
          )}
          style={styles.listItem}
        />
        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
        {biometricAvailable && (
          <>
            <List.Item
              title="Biometric Authentication"
              titleStyle={[
                styles.listItemTitle,
                { color: theme.colors.onSurface },
              ]}
              left={(props) => (
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
              right={(props) => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={onToggleBiometric}
                  color={theme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
            <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
          </>
        )}
        <List.Item
          title="Dark Mode"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <MaterialCommunityIcons
              name="theme-light-dark"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
          style={styles.listItem}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
            },
          ]}
        >
          Connected Accounts
        </Text>
        <List.Item
          title="Google Account"
          description="Connected"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={(props) => (
            <MaterialCommunityIcons
              name="google"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <Text
              style={{
                color: theme.colors.primary,
                fontFamily: "Roboto-Medium",
              }}
            >
              Connected
            </Text>
          )}
          style={styles.listItem}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
            },
          ]}
        >
          App
        </Text>
        <List.Item
          title="About MoneyMate"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => setAboutModalOpen(true)}
          style={styles.listItem}
        />
        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
        <List.Item
          title="Help & Support"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <MaterialCommunityIcons
              name="help-circle"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {}}
          style={styles.listItem}
        />
        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
        <List.Item
          title="Privacy Policy"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <MaterialCommunityIcons
              name="shield"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {}}
          style={styles.listItem}
        />
        <Divider style={{ backgroundColor: theme.colors.surfaceVariant }} />
        <List.Item
          title="Terms of Service"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={(props) => (
            <MaterialCommunityIcons
              name="file-document"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          right={(props) => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {}}
          style={styles.listItem}
        />
      </View>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={[styles.logoutButton, { borderColor: "#F44336" }]}
        textColor="#F44336"
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="logout" size={size} color={color} />
        )}
      >
        Logout
      </Button>

      {/* About Modal */}
      <Modal
        ref={aboutModalRef}
        style={[styles.aboutModal, { backgroundColor: theme.colors.surface }]}
        position="center"
        isOpen={aboutModalOpen}
        onClosed={() => setAboutModalOpen(false)}
        backdropPressToClose
        swipeToClose
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            About MoneyMate
          </Text>
          <TouchableOpacity onPress={() => setAboutModalOpen(false)}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.aboutContent}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={64}
              color={theme.colors.primary}
            />
            <Text style={[styles.appName, { color: theme.colors.primary }]}>
              MoneyMate
            </Text>
            <Text
              style={[styles.version, { color: theme.colors.onSurfaceVariant }]}
            >
              Version 1.0.0
            </Text>
          </View>

          <Text style={[styles.aboutText, { color: theme.colors.onSurface }]}>
            MoneyMate is a comprehensive loan management app designed for
            lenders to track loans, manage borrowers, and monitor repayments.
          </Text>

          <Text style={[styles.aboutText, { color: theme.colors.onSurface }]}>
            With MoneyMate, you can create and manage loans, track payments,
            send reminders, and generate reports.
          </Text>

          <Text
            style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}
          >
            © 2025 MoneyMate. All rights reserved.
          </Text>
        </View>

        <Button
          mode="outlined"
          onPress={() => setAboutModalOpen(false)}
          style={styles.closeButton}
          textColor={theme.colors.primary}
        >
          Close
        </Button>
      </Modal>

      {/* Render the AlertComponent */}
      <AlertComponent />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 24,
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
    marginBottom: 16,
  },
  editProfileButton: {
    borderWidth: 1,
  },
  section: {
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    padding: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemTitle: {
    fontFamily: "Roboto-Regular",
  },
  logoutButton: {
    margin: 24,
    borderWidth: 1,
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
    marginTop: 8,
  },
  version: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
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
    marginTop: 20,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
  },
});
