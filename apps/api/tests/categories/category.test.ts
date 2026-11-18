import { describe, expect, it } from "vitest";
import { createWorker } from "../test-utils/app-harness";
import { unwrapResponse } from "../test-utils/unwrap";
import type { Category, CategoryDetail } from "@/categories/category.types";

const { app, login } = createWorker();

const user = { email: "category.user@example.com", name: "Category User" };

describe("/api/category", () => {
  it("enables crud operations on category", async () => {
    const token = await login(user);
    const authedApp = app.auth(token);

    expect(await unwrapResponse<Category[]>(authedApp.get("/api/category"))).toEqual([]);

    const added = await unwrapResponse<Category>(
      authedApp.post("/api/category", {
        name: "Groceries",
        description: "Food and household items",
      }),
    );

    expect(added).toEqual({
      id: added.id,
      name: "Groceries",
      description: "Food and household items",
      archived: false,
    });

    expect(await unwrapResponse<Category[]>(authedApp.get("/api/category"))).toEqual([added]);

    expect(
      (
        await authedApp.put(`/api/category/${added.id.toString()}`, {
          name: "Dining",
          description: "Restaurants and takeout",
          archived: true,
        })
      ).status,
    ).toBe(204);

    const updated = await unwrapResponse<CategoryDetail>(
      authedApp.get(`/api/category/${added.id.toString()}`),
    );
    expect(updated).toEqual({
      id: added.id,
      name: "Dining",
      description: "Restaurants and takeout",
      archived: true,
      canDelete: true,
    });

    expect((await authedApp.delete(`/api/category/${added.id.toString()}`)).status).toBe(204);
    expect(await unwrapResponse<Category[]>(authedApp.get("/api/category"))).toEqual([]);
  });

  it("rejects a category with a duplicate name", async () => {
    const token = await login(user);
    const authedApp = app.auth(token);

    await unwrapResponse<Category>(authedApp.post("/api/category", { name: "Groceries" }));

    const response = await authedApp.post("/api/category", { name: "Groceries" });

    expect(response.status).toBe(409);
  });
});
