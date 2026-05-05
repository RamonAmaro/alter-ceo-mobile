/**
 * Logger abstraction.
 *
 * No-op por padrão. Quando integrarmos um serviço (Sentry, Datadog, etc.)
 * basta plugar nas funções `report*` deste arquivo — o resto do código não muda.
 *
 * REGRA (.claude/rules/error-handling.md): nunca usar console.* diretamente.
 * Toda observabilidade passa por este módulo.
 */

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

function reportException(_err: unknown, _context?: ErrorContext): void {
  // Plug here: Sentry.captureException(_err, { extra: _context })
}

function reportMessage(_message: string, _level: Level, _context?: ErrorContext): void {
  // Plug here: Sentry.captureMessage(_message, _level)
}

function reportBreadcrumb(_breadcrumb: Breadcrumb): void {
  // Plug here: Sentry.addBreadcrumb({ ..._breadcrumb })
}

export const logger = {
  /** Captura uma exceção. Usar em catches que antes usariam console.error(err). */
  captureException: (err: unknown, context?: ErrorContext): void => {
    reportException(err, context);
  },

  /** Mensagem nivel error sem objeto Error (caso falhas conhecidas). */
  error: (message: string, context?: ErrorContext): void => {
    reportMessage(message, "error", context);
  },

  /** Mensagem nivel warn (degradação, fallbacks). */
  warn: (message: string, context?: ErrorContext): void => {
    reportMessage(message, "warn", context);
  },

  /** Mensagem nivel info (eventos relevantes de fluxo). */
  info: (message: string, context?: ErrorContext): void => {
    reportMessage(message, "info", context);
  },

  /** Breadcrumb — eventos contextuais que ajudam a debugar uma exceção futura. */
  breadcrumb: (breadcrumb: Breadcrumb): void => {
    reportBreadcrumb(breadcrumb);
  },
} as const;
