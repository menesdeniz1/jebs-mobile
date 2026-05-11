// Mock AsyncStorage
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: (...args: unknown[]) => mockGetItem(...args),
    setItem: (...args: unknown[]) => mockSetItem(...args),
    removeItem: (...args: unknown[]) => mockRemoveItem(...args),
  },
}));

// Mock Toast
jest.mock('../components/ui/Toast', () => ({
  showError: jest.fn(),
}));

// Mock crypto module (avoid SecureStore)
jest.mock('../lib/crypto', () => ({
  encrypt: jest.fn((s: string) => Promise.resolve('enc_' + s)),
  decrypt: jest.fn((s: string) => Promise.resolve(s.replace('enc_', ''))),
  isEncrypted: jest.fn((s: string) => s.startsWith('enc_')),
}));

import {
  loadFromStorage,
  persistToStorage,
  removeFromStorage,
  loadEncrypted,
  persistEncrypted,
} from '../store/persistence';
import { showError } from '../components/ui/Toast';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('loadFromStorage', () => {
  it('returns parsed JSON on success', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([1, 2, 3]));
    const result = await loadFromStorage('key', []);
    expect(result).toEqual([1, 2, 3]);
    expect(mockGetItem).toHaveBeenCalledWith('key');
  });

  it('returns fallback when key not found', async () => {
    mockGetItem.mockResolvedValue(null);
    const result = await loadFromStorage('key', 'default');
    expect(result).toBe('default');
  });

  it('returns fallback on parse error', async () => {
    mockGetItem.mockResolvedValue('not-json{{{');
    const result = await loadFromStorage('key', []);
    expect(result).toEqual([]);
  });

  it('returns fallback on storage error', async () => {
    mockGetItem.mockRejectedValue(new Error('storage error'));
    const result = await loadFromStorage('key', 42);
    expect(result).toBe(42);
  });
});

describe('persistToStorage', () => {
  it('writes JSON string to storage', async () => {
    mockSetItem.mockResolvedValue(undefined);
    const result = await persistToStorage('key', { a: 1 });
    expect(result).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith('key', '{"a":1}');
  });

  it('retries once on failure then succeeds', async () => {
    mockSetItem
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValueOnce(undefined);
    const result = await persistToStorage('key', 'value');
    expect(result).toBe(true);
    expect(mockSetItem).toHaveBeenCalledTimes(2);
  });

  it('shows error toast after both attempts fail', async () => {
    mockSetItem
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'));
    const result = await persistToStorage('key', 'value');
    expect(result).toBe(false);
    expect(showError).toHaveBeenCalledWith('Veri kaydedilemedi. Lütfen tekrar deneyin.');
  });
});

describe('removeFromStorage', () => {
  it('removes key successfully', async () => {
    mockRemoveItem.mockResolvedValue(undefined);
    const result = await removeFromStorage('key');
    expect(result).toBe(true);
    expect(mockRemoveItem).toHaveBeenCalledWith('key');
  });

  it('returns false on error (no throw)', async () => {
    mockRemoveItem.mockRejectedValue(new Error('fail'));
    const result = await removeFromStorage('key');
    expect(result).toBe(false);
  });
});

describe('loadEncrypted', () => {
  it('decrypts encrypted data', async () => {
    mockGetItem.mockResolvedValue('enc_[1,2,3]');
    const result = await loadEncrypted('key', []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('loads legacy unencrypted JSON directly', async () => {
    mockGetItem.mockResolvedValue('[4,5,6]');
    const result = await loadEncrypted('key', []);
    expect(result).toEqual([4, 5, 6]);
  });

  it('returns fallback when key not found', async () => {
    mockGetItem.mockResolvedValue(null);
    const result = await loadEncrypted('key', 'default');
    expect(result).toBe('default');
  });
});

describe('persistEncrypted', () => {
  it('encrypts and writes to storage', async () => {
    mockSetItem.mockResolvedValue(undefined);
    const result = await persistEncrypted('key', { x: 1 });
    expect(result).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith('key', 'enc_{"x":1}');
  });
});
