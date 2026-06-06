/**
 * Tests for crypto.ts web platform fallback.
 * Separate file because crypto module caches the key — need fresh module.
 */

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

import { encrypt, decrypt } from '../lib/crypto';

describe('crypto web platform', () => {
  it('uses static fallback key and roundtrips correctly', async () => {
    const encrypted = await encrypt('web test data');
    expect(encrypted).toBeDefined();
    expect(encrypted.length).toBeGreaterThan(0);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe('web test data');
  });

  it('roundtrips Turkish characters on web', async () => {
    const encrypted = await encrypt('Şüpheli İfadesi');
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe('Şüpheli İfadesi');
  });
});
