import { describe, expect, it } from "vitest";
import { getRequestContext, runWithRequestContext } from "../../src/core/request-context";
import type { User } from "../../src/users/user.types";

const user: User = {
  id: 1,
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  subject: "subject-1",
  groupId: 7,
};

describe("getRequestContext", () => {
  it("throws outside of a request scope", () => {
    expect(() => {
      getRequestContext();
    }).toThrow("Attempted to use request context outside of a request scope.");
  });

  it("returns the store inside a request scope", async () => {
    await runWithRequestContext(() => {
      expect(getRequestContext()).toEqual({});
      return Promise.resolve();
    });
  });

  it("shares mutations with nested async calls", async () => {
    await runWithRequestContext(async () => {
      const context = getRequestContext();
      context.user = user;

      await Promise.resolve();
      await Promise.resolve();

      expect(getRequestContext().user).toEqual(user);
      expect(getRequestContext()).toBe(context);
    });
  });

  it("isolates concurrent request scopes", async () => {
    const seen: (User | undefined)[] = [];

    await Promise.all([
      runWithRequestContext(async () => {
        getRequestContext().user = user;
        await Promise.resolve();
        seen.push(getRequestContext().user);
      }),
      runWithRequestContext(async () => {
        await Promise.resolve();
        seen.push(getRequestContext().user);
      }),
    ]);

    expect(seen).toEqual([user, undefined]);
  });

  it("leaves no store behind after completion", async () => {
    await runWithRequestContext(() => {
      getRequestContext().user = user;
      return Promise.resolve();
    });

    expect(() => {
      getRequestContext();
    }).toThrow("Attempted to use request context outside of a request scope.");
  });

  it("propagates failures from the callback", async () => {
    await expect(runWithRequestContext(() => Promise.reject(new Error("boom")))).rejects.toThrow(
      "boom",
    );
  });
});
