import { describe, expect, it } from "vitest";

describe("vitest setup", () => {
  it("runs tests in a jsdom environment", () => {
    expect(typeof document).toBe("object");
    expect(true).toBe(true);
  });
});
