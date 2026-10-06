import { describe, expect, it } from "vitest";
import { conflict, forbidden, invalid, notFound, unauthorized } from "../../src/core/errors";

describe("notFound", () => {
  it("wraps the resource and id", () => {
    const result = notFound("groupInvite", "abc");
    expect(result.isErr).toBe(true);
    expect(result.error).toEqual({ _tag: "NotFound", resource: "groupInvite", id: "abc" });
  });

  it("stringifies numeric ids", () => {
    expect(notFound("user", 42).error).toEqual({
      _tag: "NotFound",
      resource: "user",
      id: "42",
    });
  });
});

describe("conflict", () => {
  it("uses a default message", () => {
    expect(conflict().error).toEqual({
      _tag: "Conflict",
      message: "The operation conflicts with the current state of the resource.",
    });
  });

  it("accepts a custom message", () => {
    expect(conflict("already invited").error).toEqual({
      _tag: "Conflict",
      message: "already invited",
    });
  });
});

describe("unauthorized", () => {
  it("uses a default message", () => {
    expect(unauthorized().error).toEqual({
      _tag: "Unauthorized",
      message: "Authentication required or invalid credentials.",
    });
  });

  it("accepts a custom message", () => {
    expect(unauthorized("nope").error).toEqual({ _tag: "Unauthorized", message: "nope" });
  });
});

describe("forbidden", () => {
  it("uses a default message", () => {
    expect(forbidden().error).toEqual({
      _tag: "Forbidden",
      message: "The requested operation is forbidden.",
    });
  });

  it("accepts a custom message", () => {
    expect(forbidden("admins only").error).toEqual({
      _tag: "Forbidden",
      message: "admins only",
    });
  });
});

describe("invalid", () => {
  it("keeps every issue", () => {
    const issues = [
      { path: "email", message: "Invalid email" },
      { path: "name", message: "Required" },
    ];
    expect(invalid(issues).error).toEqual({ _tag: "Validation", issues });
  });

  it("supports an empty issue list", () => {
    expect(invalid([]).error).toEqual({ _tag: "Validation", issues: [] });
  });
});
