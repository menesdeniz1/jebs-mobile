/**
 * Type declarations for optional dependencies.
 * These modules may not be installed; the app handles their absence gracefully.
 */

// @sentry/react-native is optional (P2-15)
declare module '@sentry/react-native' {
  export function init(options: {
    dsn: string;
    enabled?: boolean;
    tracesSampleRate?: number;
    sendDefaultPii?: boolean;
  }): void;
  export function captureException(error: Error): void;
  export function withScope(callback: (scope: {
    setTag: (key: string, value: string) => void;
  }) => void): void;
  export function addBreadcrumb(breadcrumb: {
    message: string;
    category: string;
    data?: Record<string, string>;
    level: string;
  }): void;
}
