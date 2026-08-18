import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const RECENT_SEARCHES_KEY = "matelior_recent_searches";
const MAX_RECENT_SEARCHES = 4;

let memoryFallback: string[] = [];

export async function getRecentSearches(): Promise<string[]> {
  try {
    if (Platform.OS === "web") {
      const item = typeof localStorage !== "undefined" ? localStorage.getItem(RECENT_SEARCHES_KEY) : null;
      return item ? JSON.parse(item) : memoryFallback;
    }
    const raw = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return memoryFallback;
  }
}

export async function saveRecentSearch(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();

  try {
    const existing = await getRecentSearches();
    const filtered = existing.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    memoryFallback = updated;

    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }
    } else {
      await SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }

    return updated;
  } catch {
    return memoryFallback;
  }
}

export async function removeRecentSearch(query: string): Promise<string[]> {
  try {
    const existing = await getRecentSearches();
    const updated = existing.filter((item) => item.toLowerCase() !== query.toLowerCase());
    memoryFallback = updated;

    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      }
    } else {
      await SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }

    return updated;
  } catch {
    return memoryFallback;
  }
}

export async function clearRecentSearches(): Promise<void> {
  memoryFallback = [];
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
      }
    } else {
      await SecureStore.deleteItemAsync(RECENT_SEARCHES_KEY);
    }
  } catch {
    // ignore
  }
}
