/** Versioned authenticated storage for the prototype. No insecure fallback. */
import * as SecureStore from 'expo-secure-store';
import { getRandomBytesAsync } from 'expo-crypto';
import { Platform } from 'react-native';
import { gcm } from '@noble/ciphers/aes';
import { bytesToHex, hexToBytes, utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils';

const KEY_ALIAS = '@gendarme_aes_gcm_key_v2';
const PREFIX = 'aesgcm-v2:';
let keyPromise: Promise<Uint8Array> | null = null;

async function getKey(): Promise<Uint8Array> {
  if (Platform.OS === 'web') throw new Error('Sensitive persistence is disabled on web.');
  if (!keyPromise) {
    keyPromise = (async () => {
      const stored = await SecureStore.getItemAsync(KEY_ALIAS);
      if (stored !== null) {
        if (!/^[0-9a-f]{64}$/.test(stored)) throw new Error('Invalid stored key; recovery required.');
        return hexToBytes(stored);
      }
      const key = await getRandomBytesAsync(32);
      await SecureStore.setItemAsync(KEY_ALIAS, bytesToHex(key));
      return key;
    })();
    keyPromise.catch(() => { keyPromise = null; });
  }
  return keyPromise;
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const nonce = await getRandomBytesAsync(12);
  const encrypted = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
  return PREFIX + bytesToHex(nonce) + ':' + bytesToHex(encrypted);
}

export async function decrypt(ciphertext: string): Promise<string> {
  if (!isEncrypted(ciphertext)) throw new Error('Legacy/invalid data requires explicit recovery; it was not deleted.');
  const parts = ciphertext.slice(PREFIX.length).split(':');
  const key = await getKey();
  return bytesToUtf8(gcm(key, hexToBytes(parts[0])).decrypt(hexToBytes(parts[1])));
}

export function isEncrypted(data: string): boolean {
  return /^aesgcm-v2:[0-9a-f]{24}:(?:[0-9a-f]{2}){16,}$/.test(data);
}
