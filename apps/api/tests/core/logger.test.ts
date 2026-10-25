import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "@/core/logger";

interface LogEntry {
  readonly timestamp: string;
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
  readonly [key: string]: unknown;
}

describe("createLogger", () => {
  let captured: LogEntry[];
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  function capture(entry: LogEntry) {
    captured.push(entry);
  }

  beforeEach(() => {
    captured = [];
    debugSpy = vi.spyOn(console, "debug").mockImplementation(capture);
    infoSpy = vi.spyOn(console, "info").mockImplementation(capture);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(capture);
    errorSpy = vi.spyOn(console, "error").mockImplementation(capture);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("writes each level to its matching console method", () => {
    const logger = createLogger("debug");

    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");

    expect(debugSpy).toHaveBeenCalledOnce();
    expect(infoSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(captured.map((entry) => entry.message)).toEqual([
      "debug message",
      "info message",
      "warn message",
      "error message",
    ]);
  });

  it("drops entries below the minimum level, defaulting to info", () => {
    const logger = createLogger();

    logger.debug("hidden");
    logger.info("visible");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledOnce();
  });

  it("honors a custom minimum level", () => {
    const logger = createLogger("warn");

    logger.debug("hidden");
    logger.info("hidden");
    logger.warn("visible");
    logger.error("visible");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("merges the request context into the entry", () => {
    const context = {
      additionalInfo: "more info",
    };
    const logger = createLogger();

    logger.info("hello", context);

    expect(captured[0]).toMatchObject({
      message: "hello",
      additionalInfo: "more info",
    });
  });
});
