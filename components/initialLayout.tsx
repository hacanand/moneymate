import React, { useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Early return if Clerk is not loaded
    if (!isLoaded) return null;
 

  // Memoized callback function for redirection logic
  const handleRedirection = useCallback(() => {
    const isAuthScreen = segments[0] === "(auth)";
    // Redirect logic based on auth state and screen type
    if (!isSignedIn && !isAuthScreen) {
      router.replace("/(auth)/login");
    } else if (isSignedIn) {
      router.replace("/auth-gate");
    }
  }, [isSignedIn, segments, router]); // Dependencies for the callback

  useEffect(() => {
    handleRedirection(); // Call the memoized redirection logic
  }, [handleRedirection]); // Only run when the redirection logic changes

  return <Stack screenOptions={{ headerShown: false }} />;
}
