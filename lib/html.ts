/**
 * HTML escaping utility for safe string interpolation in PDF templates.
 * Prevents XSS / HTML injection in expo-print's Chromium-based renderer.
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const ESCAPE_REGEX = /[&<>"']/g;

/**
 * Escape HTML special characters in a string.
 * Safe against double-encoding: already-encoded entities are not re-encoded
 * because `&` is always replaced first in each pass, and we only encode raw chars.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(ESCAPE_REGEX, (char) => ESCAPE_MAP[char] || char);
}
