/**
 * Crash reporting module (P2-15).
 *
 * Sentry integration, OFF by default. To enable:
 * 1. Install: npm install @sentry/react-native
 * 2. Set SENTRY_DSN in app.json extra.sentryDsn
 * 3. Enable: call enableCrashReporting() on app start
 *
 * This module provides a no-op fallback when Sentry is not installed,
 * so the app never crashes due to missing crash reporting.
 */

// ── Configuration ─────────────────────────────────────

let _isEnabled = false;

/**
 * Check if crash reporting is enabled.
 */
export function isCrashReportingEnabled(): boolean {
  return _isEnabled;
}

/**
 * Initialize and enable crash reporting.
 * Call this from _layout.tsx if the user has opted in.
 *
 * @param dsn - Sentry DSN string. If not provided, reads from app.json extra.
 */
export async function enableCrashReporting(dsn?: string): Promise<void> {
  if (_isEnabled) return;

  try {
    // Dynamic import to avoid bundling Sentry when not installed
    const Sentry = await import('@sentry/react-native').catch(() => null);

    if (!Sentry) {
      console.warn(
        '[crash-reporting] @sentry/react-native not installed. ' +
        'Install it to enable crash reporting: npm install @sentry/react-native'
      );
      return;
    }

    const sentryDsn = dsn || '';
    if (!sentryDsn) {
      console.warn('[crash-reporting] No DSN provided. Skipping initialization.');
      return;
    }

    Sentry.init({
      dsn: sentryDsn,
      // Don't send in development
      enabled: __DEV__ === false,
      // Sample rate for performance monitoring (0 = disabled)
      tracesSampleRate: 0,
      // Attach user information (OFF — we don't collect PII by default)
      sendDefaultPii: false,
    });

    _isEnabled = true;
    console.log('[crash-reporting] Sentry initialized successfully');
  } catch (error) {
    console.warn('[crash-reporting] Failed to initialize Sentry:', error);
  }
}

/**
 * Report a non-fatal error to Sentry.
 * No-ops when crash reporting is disabled.
 */
export function reportError(error: Error, context?: Record<string, string>): void {
  if (!_isEnabled) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/react-native');
    if (context) {
      Sentry.withScope((scope: { setTag: (key: string, value: string) => void }) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch {
    // Silent — crash reporting should never crash the app
  }
}

/**
 * Add a breadcrumb for debugging context.
 * No-ops when crash reporting is disabled.
 */
export function addBreadcrumb(
  message: string,
  category: string = 'app',
  data?: Record<string, string>
): void {
  if (!_isEnabled) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/react-native');
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  } catch {
    // Silent
  }
}
