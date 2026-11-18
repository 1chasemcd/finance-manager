import { describe, expect, it } from "vitest";
import { createFakeRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { TransactionService } from "@/transactions/transaction.service";
import { CurrentUser } from "@/identity/current-user";
import type { SearchTransactionsRequest } from "@finapp/schema";

const repos = createFakeRepositoryContainer();
const { seedGroup, seedUser, seedCategory, seedTransaction } = createDataSeeds(repos);

function search(overrides: Partial<SearchTransactionsRequest> = {}): SearchTransactionsRequest {
  return { page: 0, limit: 50, ...overrides };
}

async function setup() {
  const group = await seedGroup();
  const user = await seedUser({ group });
  const currentUser = new CurrentUser(() => ({ user }));
  return {
    group,
    user,
    service: new TransactionService(repos.transactions, currentUser),
  };
}

describe("TransactionService.get", () => {
  it("returns transaction with specified id", async () => {
    const { group, service } = await setup();
    const transaction = await seedTransaction({
      group,
      date: "2026-02-14",
      amount: 1250,
      summary: "Groceries",
    });

    expect(await service.get(transaction.id)).toEqual({
      id: transaction.id,
      date: "2026-02-14",
      amount: 1250,
      summary: "Groceries",
      categoryId: transaction.categoryId,
      sourceId: transaction.sourceId,
    });
  });

  it("returns undefined when transaction is not within request group", async () => {
    const { service } = await setup();
    const foreignGroup = await seedGroup();
    const transaction = await seedTransaction({ group: foreignGroup });

    expect(await service.get(transaction.id)).toBeUndefined();
  });

  it("returns undefined for an unknown id", async () => {
    const { service } = await setup();

    expect(await service.get(-1)).toBeUndefined();
  });
});

describe("TransactionService.search", () => {
  it("returns transactions and total count for the group", async () => {
    const { group, service } = await setup();
    const earliest = await seedTransaction({ group, date: "2026-01-01" });
    const latest = await seedTransaction({ group, date: "2026-02-01" });

    expect(await service.search(search())).toEqual({
      count: 2,
      transactions: [latest, earliest],
    });
  });

  it("returns total count even when search results are filtered", async () => {
    const { group, service } = await setup();
    const category = await seedCategory({ group });
    const matching = await seedTransaction({ group, category });
    await seedTransaction({ group });

    expect(await service.search(search({ categoryId: category.id }))).toEqual({
      count: 2,
      transactions: [matching],
    });
  });

  it("does not include transactions from other group", async () => {
    const { service } = await setup();
    const otherGroup = await seedGroup();
    await seedTransaction({ group: otherGroup });

    expect(await service.search(search())).toEqual({ count: 0, transactions: [] });
  });
});
