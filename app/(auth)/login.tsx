import { useAuth, useSSO } from "@clerk/clerk-expo";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// Warm up browser for smoother SSO
const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

type JSX = React.JSX.Element;
const Login: React.FC = (): JSX => {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  
  const handleGoogleSignIn =  async () => {
    try {
      const { createdSessionId, setActive  } =
        await startSSOFlow({
          strategy: "oauth_google",
        });
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/auth-gate");
      } else {
        Alert.alert(
          "Sign-In Error",
          "Unable to complete sign-in. Please try again."
        );
      }
    } catch (err: any) {
      // See Clerk docs for error structure
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        "Google Sign-In Error",
        err?.message || "Unknown error. Please try again."
      );
    }
  }
  return (
    <SafeAreaView style={styles.container}  >
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
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
        <AntDesign name="google" size={24} color="white" />
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
    backgroundColor: "#4285F4",
    borderRadius: 50,
    padding: 2,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  infoText: {
    color: "#A0A0A0",
    fontSize: 14,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
});

export default Login;
