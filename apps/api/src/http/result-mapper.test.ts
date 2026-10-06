import { ok } from "@finapp/result";
import { Hono } from "hono";
import type { JSONValue } from "hono/utils/types";
import { describe, expect, it } from "vitest";
import { mapResult } from "./result-mapper";
import {
  conflict,
  forbidden,
  invalid,
  notFound,
  unauthorized,
  type AppResult,
} from "../core/result";

async function mapJson(result: AppResult<JSONValue>): Promise<Response> {
  const app = new Hono().get("/", (c) => mapResult(c, result));
  return await app.request("/");
}

async function mapEmpty(result: AppResult): Promise<Response> {
  const app = new Hono().get("/", (c) => mapResult(c, result));
  return await app.request("/");
}

describe("mapResult", () => {
  it("responds 200 with the payload for an Ok value", async () => {
    const response = await mapJson(ok({ hello: "world" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("responds 204 without a body for an empty Ok", async () => {
    const response = await mapEmpty(ok());

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  it("responds 400 with the validation issues", async () => {
    const issues = [
      { path: "email", message: "Invalid email" },
      { path: "name", message: "Required" },
    ];
    const response = await mapJson(invalid(issues));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(issues);
  });

  it("responds 400 with an empty issue list", async () => {
    const response = await mapJson(invalid([]));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual([]);
  });

  it("responds 401 with the unauthorized message", async () => {
    const response = await mapJson(unauthorized("logged out"));

    expect(response.status).toBe(401);
    expect(await response.json()).toBe("logged out");
  });

  it("responds 403 with the forbidden message", async () => {
    const response = await mapJson(forbidden());

    expect(response.status).toBe(403);
    expect(await response.json()).toBe("The requested operation is forbidden.");
  });

  it("responds 404 naming the missing resource", async () => {
    const response = await mapJson(notFound("widget", 7));

    expect(response.status).toBe(404);
    expect(await response.json()).toBe("widget not found.");
  });

  it("responds 409 with the conflict message", async () => {
    const response = await mapJson(conflict("already exists"));

    expect(response.status).toBe(409);
    expect(await response.json()).toBe("already exists");
  });
});
