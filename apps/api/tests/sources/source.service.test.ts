import { describe, expect, it } from "vitest";
import { createFakeRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";
import { SourceService } from "@/sources/source.service";
import { CurrentUser } from "@/identity/current-user";

const repos = createFakeRepositoryContainer();
const { seedGroup, seedUser, seedSource, seedFileFormat, seedTransaction } = createDataSeeds(repos);

async function setup() {
  const group = await seedGroup();
  const user = await seedUser({ group });
  const currentUser = new CurrentUser(() => ({ user }));
  return {
    group,
    user,
    service: new SourceService(repos.sources, repos.transactions, currentUser),
  };
}

describe("SourceService.get", () => {
  it("returns source with specified id", async () => {
    const { group, user, service } = await setup();
    const fileFormat = await seedFileFormat({ group });
    const source = await seedSource({ user, fileFormat });

    expect(await service.get(source.id)).toEqual({
      canDelete: true,
      fileFormatId: fileFormat.id,
      description: null,
      id: source.id,
      name: source.name,
      ownerId: user.id,
      archived: false,
    });
  });

  it("returns undefined when source is not within request group", async () => {
    const { service } = await setup();
    const foreignGroup = await seedGroup();
    const created = await seedSource({ group: foreignGroup });

    expect(await service.get(created.id)).toBeUndefined();
  });

  it("returns undefined for an unknown groupId and id", async () => {
    const { service } = await setup();
    expect(await service.get(-1)).toBeUndefined();
  });

  it("returns canDelete false when there are transactions with a source", async () => {
    const { group, user, service } = await setup();
    const source = await seedSource({ user });
    await seedTransaction({ group, source });

    expect((await service.get(source.id))?.canDelete).toBe(false);
  });
});

describe("SourceService.all", () => {
  it("returns all sources for given groupId", async () => {
    const { group, service } = await setup();
    const s1 = await seedSource({ group });
    const s2 = await seedSource({ group });

    const result = await service.all();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(s1);
    expect(result).toContainEqual(s2);
  });

  it("returns empty array when there are no sources", async () => {
    const { service } = await setup();

    expect(await service.all()).toEqual([]);
  });

  it("does not include sources from other group", async () => {
    const { service } = await setup();
    const otherGroup = await seedGroup();
    await seedSource({ group: otherGroup });

    expect(await service.all()).toEqual([]);
  });
});

describe("SourceService.create", () => {
  it("adds source to db and returns same source", async () => {
    const name = "Bob WF Checking";
    const description = "Bob's Wells Fargo Checking Account";

    const { group, service } = await setup();
    const owner = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });

    const returned = await unwrap(
      service.create({
        name,
        description,
        ownerId: owner.id,
        fileFormatId: fileFormat.id,
      }),
    );

    expect(returned.id).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      name,
      description,
      archived: false,
      fileFormatId: fileFormat.id,
      ownerId: owner.id,
    });

    const created = await repos.sources.byId(group.id, returned.id);
    expect(created).toEqual(returned);
  });
});

describe("SourceService.update", () => {
  it("updates source", async () => {
    const { group, user, service } = await setup();

    const otherUser = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });
    const source = await seedSource({ user });

    const result = await service.update(source.id, {
      name: "Alice WF Checking",
      description: "Alice's Wells Fargo Checking Account",
      ownerId: otherUser.id,
      fileFormatId: fileFormat.id,
      archived: true,
    });

    expect(result.isOk).toBe(true);

    const updated = await repos.sources.byId(group.id, source.id);

    expect(updated).toEqual({
      id: source.id,
      name: "Alice WF Checking",
      description: "Alice's Wells Fargo Checking Account",
      ownerId: otherUser.id,
      fileFormatId: fileFormat.id,
      archived: true,
    });
  });

  it("returns NotFound when source does not exist", async () => {
    const { user, service } = await setup();

    const result = await service.update(-1, {
      name: "Test",
      ownerId: user.id,
      archived: false,
    });

    expect(result.isErr && result.error).toBe("NotFound");
  });
});

describe("SourceService.delete", () => {
  it("removes source", async () => {
    const { group, service } = await setup();
    const source = await seedSource({ group });

    const result = await service.delete(source.id);
    expect(result.isOk).toBe(true);

    const list = await repos.sources.all(group.id);
    expect(list).toEqual([]);
  });

  it("returns NotFound when source does not exist", async () => {
    const { service } = await setup();

    const result = await service.delete(-1);
    expect(result.isErr && result.error).toBe("NotFound");
  });
});
