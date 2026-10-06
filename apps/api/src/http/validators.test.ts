import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { idValidator } from "./validators";

const app = new Hono().get("/items/:id", idValidator, (c) =>
  c.json({ id: c.req.valid("param").id }),
);

describe("idValidator", () => {
  it("coerces a positive integer string", async () => {
    const response = await app.request("/items/12");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 12 });
  });

  it.each(["0", "-1", "abc", "1.5"])("rejects %s", async (value) => {
    const response = await app.request(`/items/${value}`);

    expect(response.status).toBe(400);
  });
});
