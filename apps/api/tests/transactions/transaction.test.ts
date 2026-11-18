import { describe, expect, it } from "vitest";
import { createWorker } from "../test-utils/app-harness";
import { unwrap, unwrapResponse } from "../test-utils/unwrap";
import { createDb } from "@/db/client";
import { TransactionDrizzleRepository } from "@/transactions/transaction.drizzle-repository";
import type { Category } from "@/categories/category.types";
import type { Source } from "@/sources/source.types";
import type { Transaction, TransactionList } from "@/transactions/transaction.types";
import type { User } from "@/users/user.types";

const { app, getEnv, login } = createWorker();

const user = { email: "transaction.user@example.com", name: "Transaction User" };

describe("/api/transaction", () => {
  it("returns transactions for the current group", async () => {
    const token = await login(user);
    const authedApp = app.auth(token);

    const ownerId = (await unwrapResponse<User[]>(authedApp.get("/api/user")))[0]?.id ?? 0;
    const category = await unwrapResponse<Category>(
      authedApp.post("/api/category", { name: "Groceries" }),
    );
    const source = await unwrapResponse<Source>(
      authedApp.post("/api/source", { name: "Checking", ownerId }),
    );

    const row = await getEnv()
      .DB.prepare("SELECT group_id FROM users LIMIT 1")
      .first<{ group_id: number }>();
    const groupId = row?.group_id ?? 0;

    const transactions = new TransactionDrizzleRepository(createDb(getEnv().DB));

    const earliest = await unwrap(
      transactions.create(groupId, {
        date: "2026-01-01",
        amount: 1000,
        summary: "Earliest",
        categoryId: category.id,
        sourceId: source.id,
      }),
    );
    const latest = await unwrap(
      transactions.create(groupId, {
        date: "2026-02-01",
        amount: 2000,
        summary: "Latest",
        categoryId: category.id,
        sourceId: source.id,
      }),
    );

    expect(await unwrapResponse<TransactionList>(authedApp.get("/api/transaction"))).toEqual({
      count: 2,
      transactions: [latest, earliest],
    });

    expect(
      await unwrapResponse<Transaction>(authedApp.get(`/api/transaction/${latest.id.toString()}`)),
    ).toEqual(latest);
  });

  it("returns 404 for an unknown transaction id", async () => {
    const token = await login(user);
    const authedApp = app.auth(token);

    expect((await authedApp.get("/api/transaction/9999")).status).toBe(404);
  });
});
