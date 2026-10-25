export type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

type LogLevel = "debug" | "info" | "warn" | "error";

const priorities: Record<LogLevel, number> = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

export function createLogger(minLevel: LogLevel = "info"): Logger {
  function write(level: LogLevel, message: string, context: LogContext = {}) {
    if (priorities[level] < priorities[minLevel]) return;

    const entry = {
      message,
      ...context,
    };

    switch (level) {
      case "debug":
        console.debug(entry);
        break;
      case "info":
        console.info(entry);
        break;
      case "warn":
        console.warn(entry);
        break;
      case "error":
        console.error(entry);
        break;
    }
  }

  return {
    debug: (message, context) => {
      write("debug", message, context);
    },
    info: (message, context) => {
      write("info", message, context);
    },
    warn: (message, context) => {
      write("warn", message, context);
    },
    error: (message, context) => {
      write("error", message, context);
    },
  };
}
