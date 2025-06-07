"use client";

import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
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
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
      // Use router.replace to prevent back navigation to protected screens
      setTimeout(() => {
        router.replace("/index");
      }, 300);
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
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: 0,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceVariant,
            borderRadius: 0,
            marginBottom: 0,
            paddingBottom: 32,
          },
        ]}
      >
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
        <Text
          style={[
            styles.name,
            { color: theme.colors.onSurface, marginTop: 8, marginBottom: 2 },
          ]}
        >
          {userName}
        </Text>
        <Text
          style={[
            styles.email,
            { color: theme.colors.onSurfaceVariant, marginBottom: 10 },
          ]}
        >
          {userEmail}
        </Text>
        <Button
          mode="outlined"
          onPress={() => {
            showAlert({
              title: "Profile Management",
              message:
                "Profile editing is managed through Clerk's user portal.",
            });
          }}
          style={[
            styles.editProfileButton,
            {
              borderColor: theme.colors.primary,
              borderRadius: 8,
              marginTop: 8,
            },
          ]}
          textColor={theme.colors.primary}
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name="account-edit"
              size={size}
              color={color}
            />
          )}
          contentStyle={{ height: 44 }}
          labelStyle={{
            fontFamily: "Roboto-Medium",
            fontSize: 15,
            letterSpacing: 0.2,
          }}
        >
          Edit Profile
        </Button>
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            marginHorizontal: 12,
            marginTop: 20,
            padding: 0,
            borderRadius: 16,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 14,
              paddingBottom: 8,
              fontSize: 17,
            },
          ]}
        >
          Account Settings
        </Text>
        <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        <List.Item
          title="Manage Google Account"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={() => (
            <MaterialCommunityIcons
              name="google"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            />
          )}
          right={() => (
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
              buttons: [{ text: "OK", style: "default" }],
            });
          }}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        />
        {/* <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        <List.Item
          title="Notifications"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={() => (
            <MaterialCommunityIcons
              name="bell"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            />
          )}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              color={theme.colors.primary}
            />
          )}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        /> */}
        <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        {biometricAvailable && (
          <>
            <List.Item
              title="Biometric Authentication"
              titleStyle={[
                styles.listItemTitle,
                { color: theme.colors.onSurface },
              ]}
              left={() => (
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                  style={{ marginTop: 12 }}
                />
              )}
              right={() => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={onToggleBiometric}
                  color={theme.colors.primary}
                />
              )}
              style={[styles.listItem, { paddingHorizontal: 20 }]}
            />
            <Divider
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                height: 1,
              }}
            />
          </>
        )}
        <List.Item
          title="Dark Mode"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={() => (
            <MaterialCommunityIcons
              name="theme-light-dark"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 12 }}
            />
          )}
          right={() => (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        />
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            marginHorizontal: 12,
            marginTop: 20,
            padding: 0,
            borderRadius: 16,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 16,
              paddingBottom: 8,
              fontSize: 17,
            },
          ]}
        >
          Connected Accounts
        </Text>
        <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        <List.Item
          title="Google Account"
          description="Connected"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <MaterialCommunityIcons
              name="google"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            />
          )}
          right={() => (
            <Text
              style={{
                color: theme.colors.primary,
                fontFamily: "Roboto-Medium",
              }}
            >
              Connected
            </Text>
          )}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        />
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            marginHorizontal: 12,
            marginTop: 20,
            padding: 0,
            borderRadius: 16,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
            marginBottom: 32,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              backgroundColor: theme.colors.surfaceVariant,
              color: theme.colors.onSurface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 16,
              paddingBottom: 8,
              fontSize: 17,
            },
          ]}
        >
          App
        </Text>
        <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        <List.Item
          title="About MoneyMate"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={() => (
            <MaterialCommunityIcons
              name="information"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            />
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => setAboutModalOpen(true)}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        />
        <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        <List.Item
          title="Help & Support"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={() => (
            <MaterialCommunityIcons
              name="help-circle"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            />
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {}}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        />
        <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        <List.Item
          title="Privacy Policy"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={() => (
            <MaterialCommunityIcons
              name="shield"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            />
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {}}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        />
        <Divider
          style={{ backgroundColor: theme.colors.surfaceVariant, height: 1 }}
        />
        <List.Item
          title="Terms of Service"
          titleStyle={[styles.listItemTitle, { color: theme.colors.onSurface }]}
          left={() => (
            <MaterialCommunityIcons
              name="file-document"
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginTop: 2 }}
            />
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {}}
          style={[styles.listItem, { paddingHorizontal: 20 }]}
        />
      </View>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={[
          styles.logoutButton,
          {
            borderColor: "#F44336",
            borderRadius: 8,
            marginHorizontal: 16,
            marginBottom: 32,
            backgroundColor: theme.colors.surface,
          },
        ]}
        textColor="#F44336"
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="logout" size={size} color={color} />
        )}
        contentStyle={{ height: 48 }}
        labelStyle={{
          fontFamily: "Roboto-Medium",
          fontSize: 16,
          letterSpacing: 0.5,
        }}
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
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  header: {
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  avatar: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
    marginTop: 8,
    marginBottom: 2,
  },
  email: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    marginBottom: 10,
  },
  editProfileButton: {
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 0,
    borderRadius: 8,
  },
  section: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginVertical: 0,
    marginHorizontal: 0,
    minHeight: 48,
  },
  listItemTitle: {
    fontFamily: "Roboto-Regular",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },
  aboutContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
  },
  copyright: {
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    alignSelf: "center",
    paddingHorizontal: 24,
  },
});
