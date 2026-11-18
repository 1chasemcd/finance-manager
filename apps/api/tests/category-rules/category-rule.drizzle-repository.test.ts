import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";

const repos = await createRepositoryContainer();
const { categoryRules } = repos;
const { seedGroup, seedCategory, seedCategoryRule } = createDataSeeds(repos);

describe("CategoryRuleDrizzleRepository.byId", () => {
  it("returns category rule with specified id", async () => {
    const group = await seedGroup();
    const category = await seedCategory({ group });
    const rule = await seedCategoryRule({ group, category });

    expect(await categoryRules.byId(group.id, rule.id)).toEqual({
      id: rule.id,
      pattern: rule.pattern,
      categoryId: category.id,
    });
  });

  it("returns undefined when category rule is not within request group", async () => {
    const group = await seedGroup();
    const created = await seedCategoryRule({ group });
    const otherGroup = await seedGroup();

    expect(await categoryRules.byId(otherGroup.id, created.id)).toBeUndefined();
  });

  it("returns undefined for an unknown groupId and id", async () => {
    expect(await categoryRules.byId(0, -1)).toBeUndefined();
  });
});

describe("CategoryRuleDrizzleRepository.all", () => {
  it("returns empty array when there are no category rules", async () => {
    const group = await seedGroup();

    expect(await categoryRules.all(group.id)).toEqual([]);
  });

  it("does not include category rules from other group", async () => {
    const group = await seedGroup();
    await seedCategoryRule({ group });
    const otherGroup = await seedGroup();

    expect(await categoryRules.all(otherGroup.id)).toEqual([]);
  });

  it("returns all category rules for given groupId", async () => {
    const group = await seedGroup();
    const r1 = await seedCategoryRule({ group });
    const r2 = await seedCategoryRule({ group });

    expect((await categoryRules.all(group.id)).sort()).toEqual([r1, r2].sort());
  });
});

describe("CategoryRuleDrizzleRepository.create", () => {
  it("adds category rule to db and returns same category rule", async () => {
    const pattern = "Coffee Shop";

    const group = await seedGroup();
    const category = await seedCategory({ group });

    const returned = await unwrap(
      categoryRules.create(group.id, { pattern, categoryId: category.id }),
    );
    const created = await categoryRules.byId(group.id, returned.id);

    expect(returned.id).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      pattern,
      categoryId: category.id,
    });
    expect(created).toEqual(returned);
  });

  it("allows categoryId to be null", async () => {
    const group = await seedGroup();

    const returned = await unwrap(categoryRules.create(group.id, { pattern: "Unknown" }));

    expect(returned.categoryId).toBeNull();
  });

  it("returns err when category is not within request group", async () => {
    const group = await seedGroup();
    const otherGroup = await seedGroup();
    const category = await seedCategory({ group: otherGroup });

    const result = await categoryRules.create(group.id, {
      pattern: "Coffee Shop",
      categoryId: category.id,
    });

    expect(result.isErr).toBe(true);
  });

  it("returns err when pattern is duplicate within the group", async () => {
    const group = await seedGroup();
    const existing = await seedCategoryRule({ group });

    const result = await categoryRules.create(group.id, { pattern: existing.pattern });

    expect(result.isErr).toBe(true);
  });

  it("allows the same pattern in a different group", async () => {
    const group = await seedGroup();
    const existing = await seedCategoryRule({ group });
    const otherGroup = await seedGroup();

    const result = await categoryRules.create(otherGroup.id, { pattern: existing.pattern });

    expect(result.isOk).toBe(true);
  });
});

describe("CategoryRuleDrizzleRepository.update", () => {
  it("updates category rule", async () => {
    const pattern = "Coffee Shop";
    const group = await seedGroup();
    const category = await seedCategory({ group });
    const rule = await seedCategoryRule({ group });

    const result = await categoryRules.update(group.id, rule.id, {
      pattern,
      categoryId: category.id,
    });

    expect(result.isOk).toBe(true);

    const updated = await categoryRules.byId(group.id, rule.id);

    expect(updated).toEqual({
      id: rule.id,
      pattern,
      categoryId: category.id,
    });
  });

  it("returns err when pattern is duplicate", async () => {
    const group = await seedGroup();
    const existing = await seedCategoryRule({ group });
    const toUpdate = await seedCategoryRule({ group });

    const result = await categoryRules.update(group.id, toUpdate.id, {
      pattern: existing.pattern,
    });

    expect(result.isErr).toBe(true);
  });

  it("returns err when category rule does not exist", async () => {
    const group = await seedGroup();

    const result = await categoryRules.update(group.id, -1, { pattern: "Missing" });

    expect(result.isErr).toBe(true);
  });
});

describe("CategoryRuleDrizzleRepository.delete", () => {
  it("removes category rule", async () => {
    const group = await seedGroup();
    const rule = await seedCategoryRule({ group });

    const result = await categoryRules.delete(group.id, rule.id);

    expect(result.isOk).toBe(true);
    expect(await categoryRules.all(group.id)).toEqual([]);
  });

  it("returns err when category rule does not exist", async () => {
    const group = await seedGroup();

    const result = await categoryRules.delete(group.id, -1);

    expect(result.isErr).toBe(true);
  });
});
