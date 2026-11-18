import { describe, expect, it } from "vitest";
import { createFakeRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";
import { CategoryRuleService } from "@/category-rules/category-rule.service";
import { CurrentUser } from "@/identity/current-user";

const repos = createFakeRepositoryContainer();
const { seedGroup, seedUser, seedCategory, seedCategoryRule } = createDataSeeds(repos);

async function setup() {
  const group = await seedGroup();
  const user = await seedUser({ group });
  const currentUser = new CurrentUser(() => ({ user }));
  return {
    group,
    user,
    service: new CategoryRuleService(repos.categoryRules, currentUser),
  };
}

describe("CategoryRuleService.get", () => {
  it("returns category rule with specified id", async () => {
    const { group, service } = await setup();
    const category = await seedCategory({ group });
    const rule = await seedCategoryRule({ group, category });

    expect(await service.get(rule.id)).toEqual({
      id: rule.id,
      pattern: rule.pattern,
      categoryId: category.id,
    });
  });

  it("returns undefined when category rule is not within request group", async () => {
    const { service } = await setup();
    const foreignGroup = await seedGroup();
    const created = await seedCategoryRule({ group: foreignGroup });

    expect(await service.get(created.id)).toBeUndefined();
  });

  it("returns undefined for an unknown id", async () => {
    const { service } = await setup();

    expect(await service.get(-1)).toBeUndefined();
  });
});

describe("CategoryRuleService.all", () => {
  it("returns all category rules for given groupId", async () => {
    const { group, service } = await setup();
    const r1 = await seedCategoryRule({ group });
    const r2 = await seedCategoryRule({ group });

    const result = await service.all();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(r1);
    expect(result).toContainEqual(r2);
  });

  it("returns empty array when there are no category rules", async () => {
    const { service } = await setup();

    expect(await service.all()).toEqual([]);
  });

  it("does not include category rules from other group", async () => {
    const { service } = await setup();
    const otherGroup = await seedGroup();
    await seedCategoryRule({ group: otherGroup });

    expect(await service.all()).toEqual([]);
  });
});

describe("CategoryRuleService.create", () => {
  it("adds category rule to db and returns same category rule", async () => {
    const pattern = "Coffee Shop";

    const { group, service } = await setup();
    const category = await seedCategory({ group });

    const returned = await unwrap(service.create({ pattern, categoryId: category.id }));

    expect(returned.id).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      pattern,
      categoryId: category.id,
    });

    const created = await repos.categoryRules.byId(group.id, returned.id);
    expect(created).toEqual(returned);
  });

  it("defaults categoryId to null when omitted", async () => {
    const { service } = await setup();

    const returned = await unwrap(service.create({ pattern: "Unknown" }));

    expect(returned.categoryId).toBeNull();
  });
});

describe("CategoryRuleService.update", () => {
  it("updates category rule", async () => {
    const { group, service } = await setup();
    const category = await seedCategory({ group });
    const rule = await seedCategoryRule({ group });

    const result = await service.update(rule.id, {
      pattern: "Coffee Shop",
      categoryId: category.id,
    });

    expect(result.isOk).toBe(true);

    const updated = await repos.categoryRules.byId(group.id, rule.id);

    expect(updated).toEqual({
      id: rule.id,
      pattern: "Coffee Shop",
      categoryId: category.id,
    });
  });

  it("returns NotFound when category rule does not exist", async () => {
    const { service } = await setup();

    const result = await service.update(-1, { pattern: "Missing" });

    expect(result.isErr && result.error).toBe("NotFound");
  });
});

describe("CategoryRuleService.delete", () => {
  it("removes category rule", async () => {
    const { group, service } = await setup();
    const rule = await seedCategoryRule({ group });

    const result = await service.delete(rule.id);
    expect(result.isOk).toBe(true);

    expect(await repos.categoryRules.all(group.id)).toEqual([]);
  });

  it("returns NotFound when category rule does not exist", async () => {
    const { service } = await setup();

    const result = await service.delete(-1);
    expect(result.isErr && result.error).toBe("NotFound");
  });
});
