import { TokenCache } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
 

// Create TokenCache for mobile platforms
const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        // Retrieve the stored token
        const item = await SecureStore.getItemAsync(key);

        // Log whether a value was found
        if (item) {
          console.log(`${key} was used 🔐 \n `);
        } else {
          console.log(`No values stored under key: ${key}`);
        }

        return item || null; // Return null if no token found
      } catch (error) {
        console.error("Error retrieving item from secure store: ", error);

        // Remove the item if retrieval fails
        await SecureStore.deleteItemAsync(key);
        return null; // Return null to handle the case where token retrieval fails
      }
    },

    saveToken: async (key: string, token: string) => {
      // Save token to SecureStore
      return SecureStore.setItemAsync(key, token)
        .then(() => {
          console.log(`Token stored successfully under key: ${key}`);
        })
        .catch((error) => {
          console.error(`Error saving token under key ${key}:`, error);
        });
    },
  };
};

// For non-web platforms (Android, iOS)
export const tokenCache =
  Platform.OS !== "web" ? createTokenCache() : undefined;
