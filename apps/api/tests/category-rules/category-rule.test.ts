import { describe, expect, it } from "vitest";
import { createWorker } from "../test-utils/app-harness";
import { unwrapResponse } from "../test-utils/unwrap";
import type { Category } from "@/categories/category.types";
import type { CategoryRule } from "@/category-rules/category-rule.types";

const { app, login } = createWorker();

const user = { email: "category.rule.user@example.com", name: "Category Rule User" };

describe("/api/categoryrule", () => {
  it("enables crud operations on category rule", async () => {
    const token = await login(user);
    const authedApp = app.auth(token);

    const category = await unwrapResponse<Category>(
      authedApp.post("/api/category", { name: "Coffee" }),
    );

    expect(await unwrapResponse<CategoryRule[]>(authedApp.get("/api/categoryrule"))).toEqual([]);

    const added = await unwrapResponse<CategoryRule>(
      authedApp.post("/api/categoryrule", {
        pattern: "Coffee Shop",
        categoryId: category.id,
      }),
    );

    expect(added).toEqual({
      id: added.id,
      pattern: "Coffee Shop",
      categoryId: category.id,
    });

    expect(await unwrapResponse<CategoryRule[]>(authedApp.get("/api/categoryrule"))).toEqual([
      added,
    ]);

    expect(
      (
        await authedApp.put(`/api/categoryrule/${added.id.toString()}`, {
          pattern: "Coffee and Tea",
          categoryId: null,
        })
      ).status,
    ).toBe(204);

    const updated = await unwrapResponse<CategoryRule>(
      authedApp.get(`/api/categoryrule/${added.id.toString()}`),
    );
    expect(updated).toEqual({
      id: added.id,
      pattern: "Coffee and Tea",
      categoryId: null,
    });

    expect((await authedApp.delete(`/api/categoryrule/${added.id.toString()}`)).status).toBe(204);
    expect(await unwrapResponse<CategoryRule[]>(authedApp.get("/api/categoryrule"))).toEqual([]);
  });

  it("rejects a category rule with a duplicate pattern", async () => {
    const token = await login(user);
    const authedApp = app.auth(token);

    await unwrapResponse<CategoryRule>(
      authedApp.post("/api/categoryrule", { pattern: "Coffee Shop" }),
    );

    const response = await authedApp.post("/api/categoryrule", { pattern: "Coffee Shop" });

    expect(response.status).toBe(409);
  });
});
