import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";
import type { SearchTransactionsRequest } from "@finapp/schema";

const repos = await createRepositoryContainer();
const { transactions } = repos;
const { seedGroup, seedCategory, seedSource, seedTransaction } = createDataSeeds(repos);

function search(overrides: Partial<SearchTransactionsRequest> = {}): SearchTransactionsRequest {
  return { page: 0, limit: 50, ...overrides };
}

describe("TransactionDrizzleRepository.byId", () => {
  it("returns transaction with specified id", async () => {
    const group = await seedGroup();
    const transaction = await seedTransaction({
      group,
      date: "2026-02-14",
      amount: 1250,
      summary: "Groceries",
    });

    expect(await transactions.byId(group.id, transaction.id)).toEqual({
      id: transaction.id,
      date: "2026-02-14",
      amount: 1250,
      summary: "Groceries",
      categoryId: transaction.categoryId,
      sourceId: transaction.sourceId,
    });
  });

  it("returns undefined when transaction is not within request group", async () => {
    const group = await seedGroup();
    const transaction = await seedTransaction({ group });
    const otherGroup = await seedGroup();

    expect(await transactions.byId(otherGroup.id, transaction.id)).toBeUndefined();
  });

  it("returns undefined for an unknown groupId and id", async () => {
    expect(await transactions.byId(0, -1)).toBeUndefined();
  });
});

describe("TransactionDrizzleRepository.count", () => {
  it("returns zero when there are no transactions", async () => {
    const group = await seedGroup();

    expect(await transactions.count(group.id)).toBe(0);
  });

  it("counts only transactions in the request group", async () => {
    const group = await seedGroup();
    await seedTransaction({ group });
    await seedTransaction({ group });
    const otherGroup = await seedGroup();
    await seedTransaction({ group: otherGroup });

    expect(await transactions.count(group.id)).toBe(2);
  });
});

describe("TransactionDrizzleRepository.search", () => {
  it("returns empty array when there are no transactions", async () => {
    const group = await seedGroup();

    expect(await transactions.search(group.id, search())).toEqual([]);
  });

  it("does not include transactions from other group", async () => {
    const group = await seedGroup();
    await seedTransaction({ group });
    const otherGroup = await seedGroup();
    await seedTransaction({ group: otherGroup });

    expect(await transactions.search(otherGroup.id, search())).toHaveLength(1);
  });

  it("orders transactions by date descending", async () => {
    const group = await seedGroup();
    const earliest = await seedTransaction({ group, date: "2026-01-01" });
    const latest = await seedTransaction({ group, date: "2026-03-01" });
    const middle = await seedTransaction({ group, date: "2026-02-01" });

    expect(await transactions.search(group.id, search())).toEqual([latest, middle, earliest]);
  });

  it("filters by date range", async () => {
    const group = await seedGroup();
    await seedTransaction({ group, date: "2026-01-01" });
    const middle = await seedTransaction({ group, date: "2026-02-01" });
    await seedTransaction({ group, date: "2026-03-01" });

    const result = await transactions.search(
      group.id,
      search({ minDate: "2026-01-15", maxDate: "2026-02-15" }),
    );

    expect(result).toEqual([middle]);
  });

  it("filters by amount range", async () => {
    const group = await seedGroup();
    await seedTransaction({ group, date: "2026-01-01", amount: 100 });
    const middle = await seedTransaction({ group, date: "2026-01-02", amount: 500 });
    await seedTransaction({ group, date: "2026-01-03", amount: 900 });

    const result = await transactions.search(group.id, search({ minAmount: 200, maxAmount: 800 }));

    expect(result).toEqual([middle]);
  });

  it("filters by category", async () => {
    const group = await seedGroup();
    const category = await seedCategory({ group });
    const matching = await seedTransaction({ group, category });
    await seedTransaction({ group });

    expect(await transactions.search(group.id, search({ categoryId: category.id }))).toEqual([
      matching,
    ]);
  });

  it("filters by source", async () => {
    const group = await seedGroup();
    const source = await seedSource({ group });
    const matching = await seedTransaction({ group, source });
    await seedTransaction({ group });

    expect(await transactions.search(group.id, search({ sourceId: source.id }))).toEqual([
      matching,
    ]);
  });

  it("paginates results", async () => {
    const group = await seedGroup();
    const earliest = await seedTransaction({ group, date: "2026-01-01" });
    const middle = await seedTransaction({ group, date: "2026-02-01" });
    const latest = await seedTransaction({ group, date: "2026-03-01" });

    expect(await transactions.search(group.id, search({ page: 0, limit: 2 }))).toEqual([
      latest,
      middle,
    ]);
    expect(await transactions.search(group.id, search({ page: 1, limit: 2 }))).toEqual([earliest]);
  });
});

describe("TransactionDrizzleRepository.create", () => {
  it("adds transaction to db and returns same transaction", async () => {
    const group = await seedGroup();
    const source = await seedSource({ group });
    const category = await seedCategory({ group });

    const returned = await unwrap(
      transactions.create(group.id, {
        date: "2026-01-05",
        amount: 4200,
        summary: "Paycheck",
        categoryId: category.id,
        sourceId: source.id,
      }),
    );

    expect(returned.id).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      date: "2026-01-05",
      amount: 4200,
      summary: "Paycheck",
      categoryId: category.id,
      sourceId: source.id,
    });

    expect(await transactions.byId(group.id, returned.id)).toEqual(returned);
  });

  it("defaults summary to null when omitted", async () => {
    const group = await seedGroup();
    const source = await seedSource({ group });
    const category = await seedCategory({ group });

    const returned = await unwrap(
      transactions.create(group.id, {
        date: "2026-01-05",
        amount: 4200,
        categoryId: category.id,
        sourceId: source.id,
      }),
    );

    expect(returned.summary).toBeNull();
  });

  it("returns err when source is not within request group", async () => {
    const group = await seedGroup();
    const otherGroup = await seedGroup();
    const source = await seedSource({ group: otherGroup });
    const category = await seedCategory({ group });

    const result = await transactions.create(group.id, {
      date: "2026-01-05",
      amount: 4200,
      categoryId: category.id,
      sourceId: source.id,
    });

    expect(result.isErr).toBe(true);
  });

  it("returns err when category is not within request group", async () => {
    const group = await seedGroup();
    const source = await seedSource({ group });
    const otherGroup = await seedGroup();
    const category = await seedCategory({ group: otherGroup });

    const result = await transactions.create(group.id, {
      date: "2026-01-05",
      amount: 4200,
      categoryId: category.id,
      sourceId: source.id,
    });

    expect(result.isErr).toBe(true);
  });
});
