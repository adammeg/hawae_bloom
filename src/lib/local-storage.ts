import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

function webStorage(): Storage | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  return window.localStorage;
}

export async function getLocalValue(key: string): Promise<string | null> {
  const storage = webStorage();
  if (storage) return storage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setLocalValue(key: string, value: string): Promise<void> {
  const storage = webStorage();
  if (storage) {
    storage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeLocalValue(key: string): Promise<void> {
  const storage = webStorage();
  if (storage) {
    storage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
