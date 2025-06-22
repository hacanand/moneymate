"use client";

import * as SecureStore from "expo-secure-store";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Define theme types
type ThemeType = typeof MD3LightTheme;
type ThemeContextType = {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom green theme colors
const customGreenColors = {
  primary: "#2E7D32", // Dark green
  primaryContainer: "#A5D6A7", // Light green container
  secondary: "#4CAF50", // Medium green
  secondaryContainer: "#C8E6C9", // Light green container
  tertiary: "#1B5E20", // Darker green
  tertiaryContainer: "#81C784", // Medium green container
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
};

// Light theme with green colors
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customGreenColors,
    background: "#F5F5F5",
    surface: "#FFFFFF",
    surfaceVariant: "#EEEEEE",
    onSurface: "#212121",
    onSurfaceVariant: "#757575",
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F5F5F5",
      level3: "#EEEEEE",
      level4: "#E0E0E0",
      level5: "#BDBDBD",
    },
  },
};

// Dark theme with green colors
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customGreenColors,
    background: "#121212",
    surface: "#1E1E1E",
    surfaceVariant: "#2C2C2C",
    onSurface: "#FFFFFF",
    onSurfaceVariant: "#BBBBBB",
    elevation: {
      level0: "transparent",
      level1: "#1E1E1E",
      level2: "#222222",
      level3: "#272727",
      level4: "#2C2C2C",
      level5: "#333333",
    },
  },
};

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync("theme_preference");
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        } else {
          // Use system preference as default if no saved preference
          setIsDark(colorScheme === "dark");
        }
      } catch (error) {
        console.log("Error loading theme preference:", error);
        // Fallback to system preference
        setIsDark(colorScheme === "dark");
      }
    };

    loadThemePreference();
  }, [colorScheme]);

  // Toggle theme function
  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await SecureStore.setItemAsync(
        "theme_preference",
        newTheme ? "dark" : "light"
      );
    } catch (error) {
      console.log("Error saving theme preference:", error);
    }
  };

  // Get the current theme based on dark mode state`
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
