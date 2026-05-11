/**
 * Encryption layer for PII-bearing data (drafts).
 *
 * Strategy:
 * - A random encryption key is generated once and stored in expo-secure-store
 * - Draft data is encrypted with this key before being persisted to AsyncStorage
 * - On load, data is decrypted with the same key
 *
 * This prevents plaintext PII exposure if the device is lost/stolen,
 * while respecting SecureStore's 2048-byte limit on value size.
 *
 * NOTE: This uses a simple XOR-based obfuscation rather than AES because
 * React Native doesn't ship a native crypto API. For production military-grade
 * encryption, consider react-native-quick-crypto or expo-crypto.
 * This layer is still a SIGNIFICANT improvement over plaintext AsyncStorage.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SECURE_KEY_ALIAS = '@gendarme:enc_key:v1';

/**
 * Generate a random key string (64 hex chars = 256 bits).
 * Uses Math.random as a fallback — not cryptographically secure,
 * but adequate for obfuscation-at-rest on a field device.
 */
function generateKey(): string {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

let _cachedKey: string | null = null;

/**
 * Get or create the encryption key.
 * On web, returns a static key (web has no SecureStore).
 */
async function getEncryptionKey(): Promise<string> {
  if (_cachedKey) return _cachedKey;

  // Web fallback — no SecureStore available
  if (Platform.OS === 'web') {
    _cachedKey = 'web-fallback-key-not-secure';
    return _cachedKey;
  }

  try {
    const existing = await SecureStore.getItemAsync(SECURE_KEY_ALIAS);
    if (existing) {
      _cachedKey = existing;
      return existing;
    }

    const newKey = generateKey();
    await SecureStore.setItemAsync(SECURE_KEY_ALIAS, newKey);
    _cachedKey = newKey;
    return newKey;
  } catch (error) {
    console.warn('[crypto] SecureStore unavailable, using ephemeral key:', error);
    // Fallback: generate an ephemeral key (data will be unreadable after restart)
    _cachedKey = generateKey();
    return _cachedKey;
  }
}

/**
 * XOR-based obfuscation.
 * Not cryptographically strong, but prevents trivial plaintext reads.
 */
function xorObfuscate(data: string, key: string): string {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    result.push(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  // Encode as base64-safe hex pairs
  return result.map((c) => c.toString(16).padStart(4, '0')).join('');
}

function xorDeobfuscate(hex: string, key: string): string {
  const chars: string[] = [];
  for (let i = 0; i < hex.length; i += 4) {
    const code = parseInt(hex.substring(i, i + 4), 16);
    const keyCode = key.charCodeAt((i / 4) % key.length);
    chars.push(String.fromCharCode(code ^ keyCode));
  }
  return chars.join('');
}

/**
 * Encrypt a string payload for storage.
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  return xorObfuscate(plaintext, key);
}

/**
 * Decrypt a stored payload.
 */
export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  return xorDeobfuscate(ciphertext, key);
}

/**
 * Check if a string looks like our encrypted format (all hex chars, length divisible by 4).
 * Used during migration to detect unencrypted legacy data.
 */
export function isEncrypted(data: string): boolean {
  if (data.length === 0 || data.length % 4 !== 0) return false;
  return /^[0-9a-f]+$/.test(data);
}
