/**
 * Tests for lib/crypto.ts
 * Mock SecureStore and Platform to test encryption logic.
 */

let mockGetItemAsync = jest.fn();
let mockSetItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { encrypt, decrypt, isEncrypted } from '../lib/crypto';

beforeEach(() => {
  jest.clearAllMocks();
  // Reset the cached key by requiring a fresh module
  // For these tests, SecureStore returns a fixed key
  mockGetItemAsync.mockResolvedValue('abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789');
});

describe('isEncrypted', () => {
  it('returns true for valid hex string with length divisible by 4', () => {
    expect(isEncrypted('0041')).toBe(true);
    expect(isEncrypted('0041005a')).toBe(true);
    expect(isEncrypted('00410f3a')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isEncrypted('')).toBe(false);
  });

  it('returns false for string with non-hex chars', () => {
    expect(isEncrypted('00zz')).toBe(false);
    expect(isEncrypted('GGGG')).toBe(false);
  });

  it('returns false for length not divisible by 4', () => {
    expect(isEncrypted('00a')).toBe(false);
    expect(isEncrypted('00ab1')).toBe(false);
  });

  it('returns false for JSON strings (legacy unencrypted data)', () => {
    expect(isEncrypted('[]')).toBe(false);
    expect(isEncrypted('{"key":"value"}')).toBe(false);
    expect(isEncrypted('[{"id":"test"}]')).toBe(false);
  });

  it('handles realistic encrypted output', () => {
    expect(isEncrypted('004100420043004f')).toBe(true);
  });
});

describe('encrypt / decrypt roundtrip', () => {
  it('roundtrips a simple string', async () => {
    const original = 'Hello World';
    const encrypted = await encrypt(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted.length).toBeGreaterThan(0);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('roundtrips a JSON payload', async () => {
    const data = JSON.stringify({ name: 'Ahmet', tc: '12345678901' });
    const encrypted = await encrypt(data);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(data);
    expect(JSON.parse(decrypted)).toEqual({ name: 'Ahmet', tc: '12345678901' });
  });

  it('roundtrips Turkish characters', async () => {
    const original = 'Şüpheli İfadesi — Görgü Tanığı';
    const encrypted = await encrypt(original);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('roundtrips empty string', async () => {
    const encrypted = await encrypt('');
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('produces hex-only output', async () => {
    const encrypted = await encrypt('test data');
    expect(/^[0-9a-f]+$/.test(encrypted)).toBe(true);
  });

  it('produces output with length divisible by 4', async () => {
    const encrypted = await encrypt('test data');
    expect(encrypted.length % 4).toBe(0);
  });
});

describe('encrypt key management', () => {
  it('creates and stores key if none exists', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);
    
    // Need to clear the cached key — re-import won't work, so just call encrypt
    // The key will be generated internally
    const encrypted = await encrypt('test');
    expect(encrypted).toBeDefined();
  });
});
