jest.mock('react-native', () => ({ Platform: { OS: 'web' } }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('expo-crypto', () => ({ getRandomBytesAsync: jest.fn() }));
import { encrypt } from '../lib/crypto';
test('web storage fails closed rather than using a static key', async () => {
  await expect(encrypt('synthetic')).rejects.toThrow('disabled on web');
});
