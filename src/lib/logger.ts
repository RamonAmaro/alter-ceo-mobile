interface ErrorContext {
  readonly [key: string]: unknown;
}

type Level = "debug" | "info" | "warn" | "error";

interface Breadcrumb {
  readonly category: string;
  readonly message: string;
  readonly level?: Level;
  readonly data?: ErrorContext;
}

function reportException(_err: unknown, _context?: ErrorContext): void {}

function reportMessage(_message: string, _level: Level, _context?: ErrorContext): void {}

function reportBreadcrumb(_breadcrumb: Breadcrumb): void {}

export const logger = {
  captureException: (err: unknown, context?: ErrorContext): void => {
    reportException(err, context);
  },

  error: (message: string, context?: ErrorContext): void => {
    reportMessage(message, "error", context);
  },

  warn: (message: string, context?: ErrorContext): void => {
    reportMessage(message, "warn", context);
  },

  info: (message: string, context?: ErrorContext): void => {
    reportMessage(message, "info", context);
  },

  breadcrumb: (breadcrumb: Breadcrumb): void => {
    reportBreadcrumb(breadcrumb);
  },
} as const;
