import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "@/core/logger";
import type { RequestContextData } from "@/middleware/request-context";
import type { User } from "@/users/user.types";

interface LogEntry {
  readonly timestamp: string;
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
  readonly [key: string]: unknown;
}

const user: User = {
  id: 1,
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  subject: "subject-1",
  groupId: 7,
};

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
    const logger = createLogger(() => undefined, "debug");

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
    const logger = createLogger(() => undefined);

    logger.debug("hidden");
    logger.info("visible");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledOnce();
  });

  it("honors a custom minimum level", () => {
    const logger = createLogger(() => undefined, "warn");

    logger.debug("hidden");
    logger.info("hidden");
    logger.warn("visible");
    logger.error("visible");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("stamps entries with a timestamp, level, and message", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T03:04:05.000Z"));

    const logger = createLogger(() => undefined);
    logger.info("hello");

    expect(captured).toEqual([
      { timestamp: "2026-01-02T03:04:05.000Z", level: "info", message: "hello" },
    ]);
  });

  it("merges the request context into the entry", () => {
    const context: RequestContextData = {
      requestId: "req-1",
      method: "GET",
      path: "/api/health",
      user,
    };
    const logger = createLogger(() => context);

    logger.info("hello");

    expect(captured[0]).toMatchObject({
      level: "info",
      message: "hello",
      requestId: "req-1",
      method: "GET",
      path: "/api/health",
      user,
    });
  });

  it("prefers per-call context over the request context", () => {
    const context: RequestContextData = {
      requestId: "req-1",
      method: "GET",
      path: "/api/health",
    };
    const logger = createLogger(() => context);

    logger.warn("hello", { requestId: "override", extra: true });

    expect(captured[0]).toMatchObject({
      level: "warn",
      message: "hello",
      requestId: "override",
      method: "GET",
      path: "/api/health",
      extra: true,
    });
  });

  it("logs without request context when outside a request scope", () => {
    const logger = createLogger(() => undefined);

    expect(() => {
      logger.error("no context");
    }).not.toThrow();
    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({ level: "error", message: "no context" });
  });
});
