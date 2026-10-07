import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Err, Ok, type Result } from "../src/index";

const customInspect = Symbol.for("nodejs.util.inspect.custom");

function inspect(value: object): unknown {
  const receiver = value as Record<symbol, () => unknown>;
  return receiver[customInspect]?.();
}

describe("Ok", () => {
  it("flags itself as Ok", () => {
    const result = new Ok(42);

    expect(result.isOk).toBe(true);
    expect(result.isErr).toBe(false);
    expect(result).toBeInstanceOf(Ok);
    expect(result).not.toBeInstanceOf(Err);
  });

  it("exposes the wrapped value as data", () => {
    expect(new Ok(42).data).toBe(42);
    expect(new Ok("hello").data).toBe("hello");
    expect(new Ok(undefined).data).toBeUndefined();
    expect(new Ok({ a: 1 }).data).toEqual({ a: 1 });
  });
});

describe("Err", () => {
  it("flags itself as Err", () => {
    const result = new Err("boom");

    expect(result.isOk).toBe(false);
    expect(result.isErr).toBe(true);
    expect(result).toBeInstanceOf(Err);
    expect(result).not.toBeInstanceOf(Ok);
  });

  it("exposes the wrapped error", () => {
    expect(new Err("boom").error).toBe("boom");
    expect(new Err({ _tag: "Boom" }).error).toEqual({ _tag: "Boom" });
  });
});

describe("map", () => {
  it("applies the function to an Ok value", () => {
    const result = new Ok(2).map((n) => n * 3);

    expect(result.isOk).toBe(true);
    expect(result.isOk && result.data).toBe(6);
  });

  it("returns a new Ok and leaves the original untouched", () => {
    const original = new Ok(2);
    const mapped = original.map((n) => n * 3);

    expect(mapped).not.toBe(original);
    expect(original.data).toBe(2);
  });

  it("chains across multiple maps", () => {
    const result = new Ok(2).map((n) => n + 1).map((n) => n * 10);

    expect(result.isOk && result.data).toBe(30);
  });

  it("returns the same Err without calling the function", () => {
    const source = new Err<string>("boom");
    const fn = vi.fn((n: number) => n * 3);

    const result = source.map(fn);

    expect(result).toBe(source);
    expect(fn).not.toHaveBeenCalled();
  });

  it("propagates errors thrown by the function", () => {
    expect(() =>
      new Ok(1).map(() => {
        throw new Error("boom");
      }),
    ).toThrow("boom");
  });

  it("types the result as Result<U, E>", () => {
    expectTypeOf(new Ok(2).map((n) => String(n))).toEqualTypeOf<Result<string, never>>();
    expectTypeOf(new Err<string>("boom").map(() => 0)).toEqualTypeOf<Result<number, string>>();
  });
});

describe("equals", () => {
  it("matches an instance against itself", () => {
    const result = new Ok(1);

    expect(result.equals(result)).toBe(true);
  });

  it("matches results with the same kind and value", () => {
    expect(new Ok(1).equals(new Ok(1))).toBe(true);
    expect(new Err("boom").equals(new Err("boom"))).toBe(true);

    const value = { a: 1 };
    expect(new Ok(value).equals(new Ok(value))).toBe(true);
  });

  it("rejects results with different values", () => {
    expect(new Ok(1).equals(new Ok(2))).toBe(false);
    expect(new Err("boom").equals(new Err("bang"))).toBe(false);
  });

  it("uses reference equality for object values", () => {
    expect(new Ok({ a: 1 }).equals(new Ok({ a: 1 }))).toBe(false);
  });

  it("rejects an Ok compared with an Err carrying the same value", () => {
    expect(new Ok(1).equals(new Err(1))).toBe(false);
    expect(new Err(1).equals(new Ok(1))).toBe(false);
  });

  it("rejects values that are not results", () => {
    expect(new Ok(1).equals({ _ok: true, value: 1 })).toBe(false);
    expect(new Ok(1).equals(1)).toBe(false);
    expect(new Ok(1).equals("ok")).toBe(false);
    expect(new Ok(1).equals(null)).toBe(false);
    expect(new Ok(1).equals(undefined)).toBe(false);
  });
});

describe("toJSON", () => {
  it("serialises an Ok under data", () => {
    expect(new Ok(5).toJSON()).toEqual({ _ok: true, data: 5 });
  });

  it("serialises an Err under error", () => {
    expect(new Err({ _tag: "Boom" }).toJSON()).toEqual({ _ok: false, error: { _tag: "Boom" } });
  });

  it("is used by JSON.stringify", () => {
    expect(JSON.stringify(new Ok(5))).toBe('{"_ok":true,"data":5}');
    expect(JSON.stringify(new Err({ _tag: "Boom" }))).toBe('{"_ok":false,"error":{"_tag":"Boom"}}');
  });
});

describe("toString", () => {
  it("renders the JSON representation", () => {
    expect(new Ok(5).toString()).toBe('{"_ok":true,"data":5}');
    expect(new Err({ _tag: "Boom" }).toString()).toBe('{"_ok":false,"error":{"_tag":"Boom"}}');
  });
});

describe("custom inspect", () => {
  it("hands the JSON representation to the node inspector", () => {
    expect(inspect(new Ok(5))).toEqual({ _ok: true, data: 5 });
    expect(inspect(new Err({ _tag: "Boom" }))).toEqual({
      _ok: false,
      error: { _tag: "Boom" },
    });
  });
});
