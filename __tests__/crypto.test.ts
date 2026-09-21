jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('ab'.repeat(32)),
  setItemAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: async (n: number) => new Uint8Array(require('crypto').randomBytes(n)),
}));
import { encrypt, decrypt, isEncrypted } from '../lib/crypto';
Object.assign(globalThis, { TextEncoder: require('util').TextEncoder, TextDecoder: require('util').TextDecoder });

test('roundtrips UTF-8 using an authenticated versioned envelope', async () => {
  const text = 'Synthetic İı şğ record';
  const encrypted = await encrypt(text);
  expect(isEncrypted(encrypted)).toBe(true);
  expect(await decrypt(encrypted)).toBe(text);
});
test('fresh nonce changes ciphertext', async () => {
  expect(await encrypt('same')).not.toBe(await encrypt('same'));
});
test('tampering is rejected', async () => {
  const value = await encrypt('synthetic');
  await expect(decrypt(value.slice(0,-2)+(value.endsWith('00')?'01':'00'))).rejects.toThrow();
});
test('empty strings roundtrip', async () => {
  expect(await decrypt(await encrypt(''))).toBe('');
});
test('old XOR and plaintext are not accepted as ciphertext', async () => {
  expect(isEncrypted('0041005a')).toBe(false);
  await expect(decrypt('0041005a')).rejects.toThrow('recovery');
  expect(isEncrypted('{"x":1}')).toBe(false);
});
