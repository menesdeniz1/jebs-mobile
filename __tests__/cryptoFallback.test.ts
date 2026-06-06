/**
 * Tests for crypto.ts SecureStore failure fallback.
 * Separate file because crypto module caches the key at module level.
 */

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockRejectedValue(new Error('SecureStore broken')),
  setItemAsync: jest.fn(),
}));

import { encrypt, decrypt } from '../lib/crypto';

describe('crypto SecureStore failure', () => {
  it('falls back to ephemeral key when SecureStore throws', async () => {
    const encrypted = await encrypt('fallback test');
    expect(encrypted).toBeDefined();
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe('fallback test');
  });

  it('produces valid hex output with ephemeral key', async () => {
    const encrypted = await encrypt('hello');
    expect(/^[0-9a-f]+$/.test(encrypted)).toBe(true);
    expect(encrypted.length % 4).toBe(0);
  });
});
