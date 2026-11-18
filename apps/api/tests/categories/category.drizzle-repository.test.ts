import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";

const repos = await createRepositoryContainer();
const { categories, categoryRules } = repos;
const { seedGroup, seedCategory, seedCategoryRule } = createDataSeeds(repos);

describe("CategoryDrizzleRepository.byId", () => {
  it("returns category with specified id", async () => {
    const group = await seedGroup();
    const category = await seedCategory({ group });

    expect(await categories.byId(group.id, category.id)).toEqual({
      id: category.id,
      name: category.name,
      description: null,
      archived: false,
    });
  });

  it("returns undefined when category is not within request group", async () => {
    const group = await seedGroup();
    const created = await seedCategory({ group });
    const otherGroup = await seedGroup();

    expect(await categories.byId(otherGroup.id, created.id)).toBeUndefined();
  });

  it("returns undefined for an unknown groupId and id", async () => {
    expect(await categories.byId(0, -1)).toBeUndefined();
  });
});

describe("CategoryDrizzleRepository.all", () => {
  it("returns empty array when there are no categories", async () => {
    const group = await seedGroup();

    expect(await categories.all(group.id)).toEqual([]);
  });

  it("does not include categories from other group", async () => {
    const group = await seedGroup();
    await seedCategory({ group });
    const otherGroup = await seedGroup();

    expect(await categories.all(otherGroup.id)).toEqual([]);
  });

  it("returns all categories for given groupId", async () => {
    const group = await seedGroup();
    const c1 = await seedCategory({ group });
    const c2 = await seedCategory({ group });

    expect((await categories.all(group.id)).sort()).toEqual([c1, c2].sort());
  });
});

describe("CategoryDrizzleRepository.create", () => {
  it("adds category to db and returns same category", async () => {
    const name = "Groceries";
    const description = "Food and household items";

    const group = await seedGroup();

    const returned = await unwrap(categories.create(group.id, { name, description }));
    const created = await categories.byId(group.id, returned.id);

    expect(returned.id).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      name,
      description,
      archived: false,
    });
    expect(created).toEqual(returned);
  });

  it("defaults description to null when omitted", async () => {
    const group = await seedGroup();

    const returned = await unwrap(categories.create(group.id, { name: "Groceries" }));

    expect(returned.description).toBeNull();
  });

  it("returns err when name is duplicate within the group", async () => {
    const group = await seedGroup();
    const existing = await seedCategory({ group });

    const result = await categories.create(group.id, { name: existing.name });

    expect(result.isErr).toBe(true);
  });

  it("allows the same name in a different group", async () => {
    const group = await seedGroup();
    const existing = await seedCategory({ group });
    const otherGroup = await seedGroup();

    const result = await categories.create(otherGroup.id, { name: existing.name });

    expect(result.isOk).toBe(true);
  });
});

describe("CategoryDrizzleRepository.update", () => {
  it("updates category", async () => {
    const name = "Dining";
    const description = "Restaurants and takeout";

    const group = await seedGroup();
    const category = await seedCategory({ group });

    const result = await categories.update(group.id, category.id, {
      name,
      description,
      archived: true,
    });

    expect(result.isOk).toBe(true);

    const updated = await categories.byId(group.id, category.id);

    expect(updated).toEqual({
      id: category.id,
      name,
      description,
      archived: true,
    });
  });

  it("returns err when name is duplicate", async () => {
    const group = await seedGroup();
    const existing = await seedCategory({ group });
    const toUpdate = await seedCategory({ group });

    const result = await categories.update(group.id, toUpdate.id, {
      name: existing.name,
      description: null,
      archived: false,
    });

    expect(result.isErr).toBe(true);
  });

  it("returns err when category does not exist", async () => {
    const group = await seedGroup();

    const result = await categories.update(group.id, -1, {
      name: "Missing",
      description: null,
      archived: false,
    });

    expect(result.isErr).toBe(true);
  });
});

describe("CategoryDrizzleRepository.delete", () => {
  it("removes category", async () => {
    const group = await seedGroup();
    const category = await seedCategory({ group });

    const result = await categories.delete(group.id, category.id);

    expect(result.isOk).toBe(true);
    expect(await categories.all(group.id)).toEqual([]);
  });

  it("returns err when category does not exist", async () => {
    const group = await seedGroup();

    const result = await categories.delete(group.id, -1);

    expect(result.isErr).toBe(true);
  });

  it("removes assigned category rules", async () => {
    const group = await seedGroup();
    const category = await seedCategory({ group });
    await seedCategoryRule({ group, category });
    await seedCategoryRule({ group, category });

    expect((await categoryRules.all(group.id)).length).toBe(2);
    const result = await categories.delete(group.id, category.id);

    expect(result.isOk).toBe(true);
    expect((await categoryRules.all(group.id)).length).toBe(0);
  });
});
