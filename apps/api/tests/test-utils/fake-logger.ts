import type { Logger } from "@/core/logger";

export function createFakeLogger(): Logger {
  return {
    debug: () => {
      return;
    },
    info: () => {
      return;
    },
    warn: () => {
      return;
    },
    error: () => {
      return;
    },
  };
}
