/**
 * Shared persistence layer for Zustand stores.
 *
 * Goals:
 * - Eliminate fire-and-forget writes (P1-9)
 * - Centralize load/persist boilerplate (P1-10)
 * - Surface write errors via Toast
 * - Retry once on write failure before giving up
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showError } from '../components/ui/Toast';

const RETRY_DELAY_MS = 500;

/**
 * Load a JSON value from AsyncStorage.
 * Returns the parsed value, or `fallback` if not found or parse fails.
 */
export async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to load "${key}":`, error);
    return fallback;
  }
}

/**
 * Persist a JSON value to AsyncStorage with retry.
 * Shows a Toast on failure so the user knows data wasn't saved.
 */
export async function persistToStorage<T>(key: string, value: T): Promise<boolean> {
  const data = JSON.stringify(value);
  try {
    await AsyncStorage.setItem(key, data);
    return true;
  } catch (firstError) {
    console.warn(`[storage] First write attempt for "${key}" failed, retrying...`, firstError);
    // Wait and retry once
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    try {
      await AsyncStorage.setItem(key, data);
      return true;
    } catch (retryError) {
      console.error(`[storage] Write to "${key}" failed after retry:`, retryError);
      showError('Veri kaydedilemedi. Lütfen tekrar deneyin.');
      return false;
    }
  }
}

/**
 * Remove a key from AsyncStorage (non-critical, no retry).
 */
export async function removeFromStorage(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage] Failed to remove "${key}":`, error);
    return false;
  }
}

// ── Encrypted variants (P0-5) ────────────────────────

import { encrypt, decrypt, isEncrypted } from '../lib/crypto';

/**
 * Load a JSON value from AsyncStorage, decrypting first.
 * Handles migration: if the stored data is unencrypted JSON, parse it directly.
 */
export async function loadEncrypted<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;

    // Migration: detect if the data is already encrypted
    if (isEncrypted(raw)) {
      const decrypted = await decrypt(raw);
      return JSON.parse(decrypted) as T;
    }

    // Legacy unencrypted data — parse directly, will be re-encrypted on next save
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to load encrypted "${key}":`, error);
    return fallback;
  }
}

/**
 * Encrypt and persist a JSON value to AsyncStorage with retry.
 * Writes the encrypted hex string directly (not JSON-wrapped).
 */
export async function persistEncrypted<T>(key: string, value: T): Promise<boolean> {
  try {
    const json = JSON.stringify(value);
    const encrypted = await encrypt(json);

    // Write directly to avoid double-encoding via persistToStorage
    try {
      await AsyncStorage.setItem(key, encrypted);
      return true;
    } catch (firstError) {
      console.warn(`[storage] First encrypted write for "${key}" failed, retrying...`, firstError);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      try {
        await AsyncStorage.setItem(key, encrypted);
        return true;
      } catch (retryError) {
        console.error(`[storage] Encrypted write to "${key}" failed after retry:`, retryError);
        showError('Veri kaydedilemedi. Lütfen tekrar deneyin.');
        return false;
      }
    }
  } catch (error) {
    console.error(`[storage] Encryption failed for "${key}":`, error);
    showError('Veri şifrelenemedi. Lütfen tekrar deneyin.');
    return false;
  }
}

