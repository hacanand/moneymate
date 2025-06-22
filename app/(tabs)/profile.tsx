"use client";

import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Switch,
  Text,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomAlert } from "../../components/CustomAlert";
import { useTheme } from "../../context/ThemeContext";

// Professional design constants - matching LoanCard design
const CONTENT_PADDING = 16;
const CARD_MARGIN = 16;
const BORDER_RADIUS = 16;
const SECTION_SPACING = 24;

interface ProfileItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  theme: any;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  theme,
}) => (
  <TouchableOpacity
    style={[styles.profileItem, { backgroundColor: theme.colors.surface }]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress}
  >
    <View style={styles.itemLeft}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.itemSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {rightElement ||
      (onPress && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
      ))}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Hooks
  const { theme, isDark, toggleTheme } = useTheme();
  const { getToken } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isAuthLoaded, signOut } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    checkBiometricAvailability();
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

  const onToggleBiometric = async (): Promise<void> => {
    if (!biometricAvailable) {
      showAlert({
        title: "Not Available",
        message: "Biometric authentication is not available on this device.",
      });
      return;
    }

    if (!biometricEnabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Verify your identity to enable biometric login",
          fallbackLabel: "Use passcode",
        });

        if (result.success) {
          if (user?.id) {
            await SecureStore.setItemAsync("biometric_user_id", user.id);
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
      await SecureStore.deleteItemAsync("biometric_user_id");
      await SecureStore.deleteItemAsync("clerk_session_token");
      setBiometricEnabled(false);
      showAlert({
        title: "Disabled",
        message: "Biometric login has been disabled.",
      });
    }
  };

  const handleLogout = (): void => {
    showAlert({
      title: "Confirm Logout",
      message: "Are you sure you want to log out of MoneyMate?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              await SecureStore.deleteItemAsync("biometric_user_id");
              await SecureStore.deleteItemAsync("clerk_session_token");
              setTimeout(() => {
                router.replace("/index");
              }, 300);
            } catch (error) {
              console.error("Error signing out:", error);
            }
          },
        },
      ],
    });
  };

  // Get user info
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || "No email available";
  const userName = user?.fullName || user?.firstName || "User";
  const userImageUrl = user?.imageUrl;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
  

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <Card
          style={[
            styles.profileCard,
            { backgroundColor: theme.colors.surface },
          ]}
          mode="elevated"
        >
          <Card.Content style={styles.profileCardContent}>
            <View style={styles.profileInfo}>
              <Avatar.Image
                size={64}
                source={
                  userImageUrl
                    ? { uri: userImageUrl }
                    : require("../../assets/images/icon.png")
                }
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Text
                  style={[styles.userName, { color: theme.colors.onSurface }]}
                >
                  {userName}
                </Text>
                <Text
                  style={[
                    styles.userEmail,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {userEmail}
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={() => {
                showAlert({
                  title: "Profile Management",
                  message:
                    "Profile editing is managed through your account provider.",
                });
              }}
              style={[styles.editButton, { borderColor: theme.colors.outline }]}
              textColor={theme.colors.primary}
              compact
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Settings Section */}
        <Card
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          mode="elevated"
        >
          <Card.Content style={styles.sectionContent}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Settings
            </Text>

            <ProfileItem
              icon="theme-light-dark"
              title="Dark Mode"
              theme={theme}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              }
            />

            <Divider
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />

            {biometricAvailable && (
              <>
                <ProfileItem
                  icon="fingerprint"
                  title="Biometric Authentication"
                  subtitle="Secure login with fingerprint or face"
                  theme={theme}
                  rightElement={
                    <Switch
                      value={biometricEnabled}
                      onValueChange={onToggleBiometric}
                      color={theme.colors.primary}
                    />
                  }
                />
                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />
              </>
            )}

            <ProfileItem
              icon="google"
              title="Manage Google Account"
              subtitle="Account settings and security"
              onPress={() => Linking.openURL("https://myaccount.google.com/")}
              theme={theme}
            />
          </Card.Content>
        </Card>

        {/* App Information Section */}
        <Card
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          mode="elevated"
        >
          <Card.Content style={styles.sectionContent}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              About
            </Text>

            <ProfileItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help with MoneyMate"
              onPress={() => {
                showAlert({
                  title: "Help & Support",
                  message:
                    "For support, please contact us at support@moneymate.app",
                });
              }}
              theme={theme}
            />

            <Divider
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />

            <ProfileItem
              icon="shield-check"
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={() => {
                showAlert({
                  title: "Privacy Policy",
                  message:
                    "Your privacy is important to us. We follow strict data protection standards.",
                });
              }}
              theme={theme}
            />

            <Divider
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />

            <ProfileItem
              icon="file-document"
              title="Terms of Service"
              subtitle="App usage terms and conditions"
              onPress={() => {
                showAlert({
                  title: "Terms of Service",
                  message:
                    "By using MoneyMate, you agree to our terms and conditions.",
                });
              }}
              theme={theme}
            />

            <Divider
              style={[
                styles.divider,
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />

            <ProfileItem
              icon="information"
              title="App Version"
              subtitle="1.0.0"
              theme={theme}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            {
              borderColor: theme.colors.error,
              backgroundColor: theme.colors.surface,
            },
          ]}
          textColor={theme.colors.error}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="logout" size={size} color={color} />
          )}
        >
          Logout
        </Button>
      </ScrollView>

      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: CONTENT_PADDING,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: CONTENT_PADDING,
  },
  profileCard: {
    borderRadius: BORDER_RADIUS,
    marginBottom: SECTION_SPACING,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileCardContent: {
    padding: 20,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  editButton: {
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  sectionCard: {
    borderRadius: BORDER_RADIUS,
    marginBottom: SECTION_SPACING,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderRadius: 8,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: "Roboto-Medium",
    fontWeight: "500",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  divider: {
    marginVertical: 8,
    height: 1,
  },
  logoutButton: {
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 4,
  },
});
