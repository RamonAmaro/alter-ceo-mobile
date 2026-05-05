import AsyncStorage from "@react-native-async-storage/async-storage";

import { logger } from "@/lib/logger";

function assertNonEmpty(value: string, name: string): void {
  if (value.length === 0) {
    throw new Error(`storage.versionedKey: "${name}" must be a non-empty string`);
  }
}

function joinKey(parts: readonly string[]): string {
  return parts.filter((p) => p.length > 0).join(":");
}

export const storage = {
  versionedKey: (version: string, domain: string, ...rest: readonly string[]): string => {
    assertNonEmpty(version, "version");
    assertNonEmpty(domain, "domain");
    return joinKey([version, domain, ...rest]);
  },

  getJSON: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.captureException(err, { source: "storage.getJSON", key });
      return null;
    }
  },

  setJSON: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      logger.captureException(err, { source: "storage.setJSON", key });
    }
  },

  getString: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      logger.captureException(err, { source: "storage.getString", key });
      return null;
    }
  },

  setString: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      logger.captureException(err, { source: "storage.setString", key });
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      logger.captureException(err, { source: "storage.remove", key });
    }
  },

  removeByPrefix: async (prefix: string): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const matching = keys.filter((k) => k.startsWith(prefix));
      await Promise.all(matching.map((k) => AsyncStorage.removeItem(k)));
    } catch (err) {
      logger.captureException(err, { source: "storage.removeByPrefix", prefix });
    }
  },
} as const;
