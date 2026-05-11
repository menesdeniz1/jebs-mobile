/**
 * Tests for lib/cleanup.ts
 * We mock expo-file-system and Platform to test the cleanup logic.
 */

const mockReadDirectory = jest.fn();
const mockGetInfo = jest.fn();
const mockDeleteAsync = jest.fn();

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: '/cache/',
  readDirectoryAsync: (...args: unknown[]) => mockReadDirectory(...args),
  getInfoAsync: (...args: unknown[]) => mockGetInfo(...args),
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { cleanupPDFTempFiles } from '../lib/cleanup';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cleanupPDFTempFiles', () => {
  it('deletes old PDF files from cache', async () => {
    mockReadDirectory.mockResolvedValue(['old.pdf', 'recent.pdf', 'image.png']);
    
    const now = Date.now();
    const oldTime = (now - 48 * 60 * 60 * 1000) / 1000; // 48h ago
    const recentTime = (now - 1 * 60 * 60 * 1000) / 1000; // 1h ago
    
    mockGetInfo
      .mockResolvedValueOnce({ exists: true, modificationTime: oldTime })
      .mockResolvedValueOnce({ exists: true, modificationTime: recentTime });

    mockDeleteAsync.mockResolvedValue(undefined);

    await cleanupPDFTempFiles();

    // Only old.pdf should be deleted, recent.pdf should not, image.png is not a PDF
    expect(mockDeleteAsync).toHaveBeenCalledTimes(1);
    expect(mockDeleteAsync).toHaveBeenCalledWith('/cache/old.pdf', { idempotent: true });
  });

  it('skips non-PDF files', async () => {
    mockReadDirectory.mockResolvedValue(['image.png', 'doc.docx']);
    await cleanupPDFTempFiles();
    expect(mockGetInfo).not.toHaveBeenCalled();
    expect(mockDeleteAsync).not.toHaveBeenCalled();
  });

  it('handles empty cache directory', async () => {
    mockReadDirectory.mockResolvedValue([]);
    await cleanupPDFTempFiles();
    expect(mockDeleteAsync).not.toHaveBeenCalled();
  });

  it('handles readDirectory failure gracefully', async () => {
    mockReadDirectory.mockRejectedValue(new Error('permission denied'));
    await expect(cleanupPDFTempFiles()).resolves.toBeUndefined();
  });

  it('handles individual file info failure gracefully', async () => {
    mockReadDirectory.mockResolvedValue(['broken.pdf']);
    mockGetInfo.mockRejectedValue(new Error('file error'));
    await expect(cleanupPDFTempFiles()).resolves.toBeUndefined();
  });
});
