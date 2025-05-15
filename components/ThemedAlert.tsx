"use client";

import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";

// Define the props for the ThemedAlert component
type ThemedAlertProps = {
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  options?: {
    cancelable?: boolean;
    onDismiss?: () => void;
  };
};

// Create a custom hook to show themed alerts
export const useThemedAlert = () => {
  const { isDark } = useTheme();

  // Function to show a themed alert
  const showAlert = ({
    title,
    message,
    buttons = [{ text: "OK" }],
    options = { cancelable: false },
  }: ThemedAlertProps) => {
    // On iOS, we can use the userInterfaceStyle option to set the alert appearance
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Alert.alert(title, message, buttons, {
        ...options,
        userInterfaceStyle: isDark ? "dark" : "light",
      });
    } else {
      // On Android, the alert will follow the system theme
      Alert.alert(title, message, buttons, options);
    }
  };

  return { showAlert };
};

// Component to show an alert immediately when rendered
export const ThemedAlert = ({
  title,
  message,
  buttons,
  options,
}: ThemedAlertProps) => {
  const { showAlert } = useThemedAlert();

  useEffect(() => {
    showAlert({ title, message, buttons, options });
  }, [title, message]);

  return null;
};
