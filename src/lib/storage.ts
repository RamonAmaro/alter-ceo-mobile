/**
 * Typed wrapper sobre AsyncStorage.
 *
 * Centraliza:
 * - parse/stringify de JSON com fallback seguro
 * - convenção de chaves versionadas (`v1:domain:subkey`)
 * - error swallowing best-effort consistente
 *
 * Uso:
 *   const KEY = storage.versionedKey("v1", "auth", "user");
 *   await storage.setJSON(KEY, { id, name });
 *   const user = await storage.getJSON<User>(KEY);
 *
 * Para sub-chaves por usuário:
 *   storage.versionedKey("v1", "onboarding", "draft", userId);
 *
 * NÃO usar AsyncStorage diretamente em código novo — sempre via este módulo.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { logger } from "@/lib/logger";

function joinKey(parts: readonly string[]): string {
  return parts.filter((p) => p.length > 0).join(":");
}

export const storage = {
  /** Constrói uma chave versionada padrão: "v1:auth:user" ou "v1:onboarding:draft:<userId>". */
  versionedKey: (version: string, domain: string, ...rest: readonly string[]): string =>
    joinKey([version, domain, ...rest]),

  /** Lê e parseia JSON. Retorna null se ausente, inválido ou inacessível. */
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

  /** Serializa e grava JSON. Best-effort: falhas são reportadas mas não propagadas. */
  setJSON: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      logger.captureException(err, { source: "storage.setJSON", key });
    }
  },

  /** Lê string crua. Retorna null se ausente ou inacessível. */
  getString: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      logger.captureException(err, { source: "storage.getString", key });
      return null;
    }
  },

  /** Grava string crua. Best-effort. */
  setString: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      logger.captureException(err, { source: "storage.setString", key });
    }
  },

  /** Remove uma chave. Best-effort. */
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      logger.captureException(err, { source: "storage.remove", key });
    }
  },

  /** Remove todas as chaves que começam com o prefixo dado (útil em migrations). */
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
