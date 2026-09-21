jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockRejectedValue(new Error('SecureStore broken')),
  setItemAsync: jest.fn(),
}));
jest.mock('expo-crypto', () => ({ getRandomBytesAsync: jest.fn() }));
import { encrypt } from '../lib/crypto';
test('no ephemeral fallback when key storage fails', async () => {
  await expect(encrypt('synthetic')).rejects.toThrow('SecureStore broken');
});
test('a retry still fails closed', async () => {
  await expect(encrypt('retry')).rejects.toThrow('SecureStore broken');
});
