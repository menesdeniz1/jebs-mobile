/**
 * PDF tempfile cleanup utility (P2-11).
 *
 * expo-print creates temporary PDF files in the cache directory.
 * These accumulate over time and waste storage on field devices.
 * This module cleans up old PDF temp files on app startup.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Delete PDF files from the cache directory older than MAX_AGE_MS.
 * Runs silently — errors are logged but not surfaced to the user.
 */
export async function cleanupPDFTempFiles(): Promise<void> {
  // Not available on web
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) {
    return;
  }

  try {
    const cacheDir = FileSystem.cacheDirectory;
    const files = await FileSystem.readDirectoryAsync(cacheDir);
    const now = Date.now();
    let cleaned = 0;

    for (const filename of files) {
      // Only target PDF files created by expo-print
      if (!filename.endsWith('.pdf')) continue;

      const filePath = `${cacheDir}${filename}`;
      try {
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists && info.modificationTime) {
          const ageMs = now - info.modificationTime * 1000;
          if (ageMs > MAX_AGE_MS) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            cleaned++;
          }
        }
      } catch {
        // Skip individual file errors
      }
    }

    if (cleaned > 0) {
      console.log(`[cleanup] Removed ${cleaned} old PDF temp file(s)`);
    }
  } catch (error) {
    console.warn('[cleanup] PDF temp cleanup failed:', error);
  }
}
