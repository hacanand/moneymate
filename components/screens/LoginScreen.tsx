import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import React, { JSX } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

 

const LoginScreen: React.FC = (): JSX.Element => {
  const { signIn, setActive } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      Alert.alert("Google Sign-In Error", err?.message || "Unknown error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Image
          source="../assets/images/logo.png"
          style={styles.logo}
          contentFit="cover"
        />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in with Google to access your account securely
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(200)}
        style={styles.buttonContainer}
      >
        <MaterialCommunityIcons
          name="google"
          size={24}
          color="#fff"
          style={styles.icon}
        />
        <TouchableOpacity onPress={handleGoogleSignIn}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(400)}
        style={styles.infoContainer}
      >
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="lock" size={20} color="#A0A0A0" />
          <Text style={styles.infoText}>Secure Authentication</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="flash" size={20} color="#A0A0A0" />
          <Text style={styles.infoText}>Fast & Seamless Login</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons
            name="account-check"
            size={20}
            color="#A0A0A0"
          />
          <Text style={styles.infoText}>Trusted by Millions</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C2526",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0A0",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  infoContainer: {
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  infoText: {
    color: "#A0A0A0",
    fontSize: 14,
    marginLeft: 10,
  },
});

export default LoginScreen;