import type { ErrorHandler } from "hono";
import type { Logger } from "@/core/logger";

export function createErrorHandler({
  logger,
}: {
  logger: Logger;
}): ErrorHandler<{ Bindings: Cloudflare.Env }> {
  return (err, c) => {
    logger.error("Unhandled API exception", {
      error: err.message,
      stack: err.stack,
    });

    return c.json({ error: "Internal server error" }, 500);
  };
}
