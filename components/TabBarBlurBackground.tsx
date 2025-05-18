import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet } from "react-native";

export default function TabBarBlurBackground({ style }: { style?: any }) {
  return (
    <BlurView
      intensity={90}
      tint={Platform.OS === "ios" ? "dark" : "dark"}
      style={[styles.blur, { backgroundColor: "rgba(20,20,20,0.7)" }, style]}
    />
  );
}

const styles = StyleSheet.create({
  blur: {
        borderWidth: 0.2,
    borderColor: "rgba(200, 200, 200, 0.33)",
    overflow: "hidden",
  },
});
