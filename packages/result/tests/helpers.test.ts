import { describe, expect, expectTypeOf, it } from "vitest";
import { Err, Ok, err, invariant, isResult, ok, type Result } from "../src/index";

describe("ok", () => {
  it("wraps the value in an Ok", () => {
    const result = ok(42);

    expect(result.isOk).toBe(true);
    expect(result.isErr).toBe(false);
    expect(result.data).toBe(42);
    expect(result).toBeInstanceOf(Ok);
  });

  it("creates an Ok<void> when called without a value", () => {
    const result = ok();

    expect(result.isOk).toBe(true);
    expect(result.data).toBeUndefined();
    expectTypeOf(result).toEqualTypeOf<Ok<void>>();
  });

  it("treats an explicit undefined like an empty call", () => {
    expect(ok(undefined).data).toBeUndefined();
    expectTypeOf(ok(undefined)).toEqualTypeOf<Ok<undefined>>();
  });

  it("keeps the type of the wrapped value", () => {
    expectTypeOf(ok(1)).toEqualTypeOf<Ok<number>>();
    expectTypeOf(ok("x")).toEqualTypeOf<Ok<string>>();
  });
});

describe("err", () => {
  it("wraps the tag in an Err", () => {
    const result = err();

    expect(result.isErr).toBe(true);
    expect(result.isOk).toBe(false);
    expect(result.error).toEqual({ _tag: "Err" });
    expect(result).toBeInstanceOf(Err);
  });

  it("uses the provided tag", () => {
    expect(err("Unauthorized").error).toEqual({ _tag: "Unauthorized" });
  });

  it("keeps the tag type", () => {
    expectTypeOf(err()).toEqualTypeOf<Err<{ _tag: "Err" }>>();
    expectTypeOf(err("Unauthorized")).toEqualTypeOf<Err<{ _tag: "Unauthorized" }>>();
  });
});

describe("isResult", () => {
  it("recognises Ok and Err values", () => {
    expect(isResult(ok(1))).toBe(true);
    expect(isResult(err("Boom"))).toBe(true);
    expect(isResult(new Ok(1))).toBe(true);
    expect(isResult(new Err("Boom"))).toBe(true);
  });

  it("rejects lookalikes and unrelated values", () => {
    expect(isResult({ isOk: true, isErr: false })).toBe(false);
    expect(isResult({ _ok: true, data: 1 })).toBe(false);
    expect(isResult(null)).toBe(false);
    expect(isResult(undefined)).toBe(false);
    expect(isResult("ok")).toBe(false);
    expect(isResult(0)).toBe(false);
    expect(isResult([ok(1)])).toBe(false);
    expect(isResult(() => ok(1))).toBe(false);
  });
});

describe("invariant", () => {
  it("passes for an Ok result", () => {
    expect(() => {
      invariant(ok(1));
    }).not.toThrow();
    expect(() => {
      invariant(ok(1), "unused message");
    }).not.toThrow();
  });

  it("passes for an Ok holding a falsy value", () => {
    expect(() => {
      invariant(ok(false));
    }).not.toThrow();
  });

  it("throws the message for an Err result", () => {
    expect(() => {
      invariant(err("Boom"), "boom required");
    }).toThrow("boom required");
    expect(() => {
      invariant(new Err("boom"), "boom required");
    }).toThrow("boom required");
  });

  it("falls back to the stringified error when no message is given", () => {
    expect(() => {
      invariant(err("Boom"));
    }).toThrow('{"_ok":false,"error":{"_tag":"Boom"}}');
    expect(() => {
      invariant(new Err("boom"));
    }).toThrow('{"_ok":false,"error":"boom"}');
  });

  it("throws the message for a falsy condition", () => {
    for (const value of [undefined, null, 0, "", false, Number.NaN]) {
      expect(() => {
        invariant(value, "value required");
      }).toThrow("value required");
    }
  });

  it("passes for a truthy condition", () => {
    expect(() => {
      invariant("present", "required");
    }).not.toThrow();
  });

  it("narrows a Result to Ok", () => {
    const result: Result<number, string> = ok(1);

    invariant(result);

    expectTypeOf(result).toEqualTypeOf<Ok<number>>();
    expect(result.data).toBe(1);
  });

  it("narrows a truthy condition", () => {
    const value: string | null = "present";

    invariant(value, "value required");

    expectTypeOf(value).toEqualTypeOf<string>();
    expect(value).toBe("present");
  });
});
