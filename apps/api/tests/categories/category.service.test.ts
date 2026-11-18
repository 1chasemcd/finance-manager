import { describe, expect, it } from "vitest";
import { createFakeRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";
import { CategoryService } from "@/categories/category.service";
import { CurrentUser } from "@/identity/current-user";

const repos = createFakeRepositoryContainer();
const { seedGroup, seedUser, seedCategory, seedTransaction } = createDataSeeds(repos);

async function setup() {
  const group = await seedGroup();
  const user = await seedUser({ group });
  const currentUser = new CurrentUser(() => ({ user }));
  return {
    group,
    user,
    service: new CategoryService(repos.categories, repos.transactions, currentUser),
  };
}

describe("CategoryService.get", () => {
  it("returns category with specified id", async () => {
    const { group, service } = await setup();
    const category = await seedCategory({ group });

    expect(await service.get(category.id)).toEqual({
      id: category.id,
      name: category.name,
      description: null,
      archived: false,
      canDelete: true,
    });
  });

  it("returns undefined when category is not within request group", async () => {
    const { service } = await setup();
    const foreignGroup = await seedGroup();
    const created = await seedCategory({ group: foreignGroup });

    expect(await service.get(created.id)).toBeUndefined();
  });

  it("returns undefined for an unknown id", async () => {
    const { service } = await setup();

    expect(await service.get(-1)).toBeUndefined();
  });

  it("returns canDelete false when there are transactions with a category", async () => {
    const { group, service } = await setup();
    const category = await seedCategory({ group });
    await seedTransaction({ group, category });

    expect((await service.get(category.id))?.canDelete).toBe(false);
  });
});

describe("CategoryService.all", () => {
  it("returns all categories for given groupId", async () => {
    const { group, service } = await setup();
    const c1 = await seedCategory({ group });
    const c2 = await seedCategory({ group });

    const result = await service.all();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(c1);
    expect(result).toContainEqual(c2);
  });

  it("returns empty array when there are no categories", async () => {
    const { service } = await setup();

    expect(await service.all()).toEqual([]);
  });

  it("does not include categories from other group", async () => {
    const { service } = await setup();
    const otherGroup = await seedGroup();
    await seedCategory({ group: otherGroup });

    expect(await service.all()).toEqual([]);
  });
});

describe("CategoryService.create", () => {
  it("adds category to db and returns same category", async () => {
    const name = "Groceries";
    const description = "Food and household items";

    const { group, service } = await setup();

    const returned = await unwrap(service.create({ name, description }));

    expect(returned.id).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      name,
      description,
      archived: false,
    });

    const created = await repos.categories.byId(group.id, returned.id);
    expect(created).toEqual(returned);
  });

  it("defaults description to null when omitted", async () => {
    const { service } = await setup();

    const returned = await unwrap(service.create({ name: "Groceries" }));

    expect(returned.description).toBeNull();
  });
});

describe("CategoryService.update", () => {
  it("updates category", async () => {
    const { group, service } = await setup();
    const category = await seedCategory({ group });

    const result = await service.update(category.id, {
      name: "Dining",
      description: "Restaurants and takeout",
      archived: true,
    });

    expect(result.isOk).toBe(true);

    const updated = await repos.categories.byId(group.id, category.id);

    expect(updated).toEqual({
      id: category.id,
      name: "Dining",
      description: "Restaurants and takeout",
      archived: true,
    });
  });

  it("returns NotFound when category does not exist", async () => {
    const { service } = await setup();

    const result = await service.update(-1, {
      name: "Missing",
      description: null,
      archived: false,
    });

    expect(result.isErr && result.error).toBe("NotFound");
  });
});

describe("CategoryService.delete", () => {
  it("removes category", async () => {
    const { group, service } = await setup();
    const category = await seedCategory({ group });

    const result = await service.delete(category.id);
    expect(result.isOk).toBe(true);

    expect(await repos.categories.all(group.id)).toEqual([]);
  });

  it("returns NotFound when category does not exist", async () => {
    const { service } = await setup();

    const result = await service.delete(-1);
    expect(result.isErr && result.error).toBe("NotFound");
  });
});
