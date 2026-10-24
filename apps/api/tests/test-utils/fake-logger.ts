import type { LogContext, Logger } from "@/core/logger";

export interface LogCall {
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
  readonly context: LogContext;
}

export interface FakeLogger extends Logger {
  readonly calls: LogCall[];
}

export function createFakeLogger(): FakeLogger {
  const calls: LogCall[] = [];

  function record(level: LogCall["level"]) {
    return (message: string, context: LogContext = {}) => {
      calls.push({ level, message, context });
    };
  }

  return {
    calls,
    debug: record("debug"),
    info: record("info"),
    warn: record("warn"),
    error: record("error"),
  };
}
