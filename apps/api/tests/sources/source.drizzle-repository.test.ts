import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";

const repos = await createRepositoryContainer();
const { sources } = repos;
const { seedGroup, seedUser, seedSource, seedFileFormat } = createDataSeeds(repos);

describe("SourceDrizzleRepository.byId", () => {
  it("returns source with specified id", async () => {
    const group = await seedGroup();
    const fileFormat = await seedFileFormat({ group });
    const user = await seedUser({ group });
    const source = await seedSource({ user, fileFormat });

    expect(await sources.byId(group.id, source.id)).toEqual({
      id: source.id,
      name: source.name,
      description: null,
      archived: false,
      ownerId: user.id,
      fileFormatId: fileFormat.id,
    });
  });

  it("returns undefined when source is not within request group", async () => {
    const group = await seedGroup();
    const created = await seedSource({ group });
    const otherGroup = await seedGroup();

    expect(await sources.byId(otherGroup.id, created.id)).toBeUndefined();
  });

  it("returns undefined for an unknown groupId and id", async () => {
    expect(await sources.byId(0, -1)).toBeUndefined();
  });
});

describe("SourceDrizzleRepository.all", () => {
  it("returns empty array when there are no sources", async () => {
    const group = await seedGroup();

    expect(await sources.all(group.id)).toEqual([]);
  });

  it("does not include sources from other group", async () => {
    const group = await seedGroup();
    await seedSource({ group });
    const otherGroup = await seedGroup();

    expect(await sources.all(otherGroup.id)).toEqual([]);
  });

  it("returns all sources for given groupId", async () => {
    const group = await seedGroup();
    const s1 = await seedSource({ group });
    const s2 = await seedSource({ group });

    expect((await sources.all(group.id)).sort()).toEqual([s1, s2].sort());
  });
});

describe("SourceDrizzleRepository.create", () => {
  it("adds source to db and returns same source", async () => {
    const name = "Bob WF Checking";
    const description = "Bob's Wells Fargo Checking Account";

    const group = await seedGroup();
    const owner = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });

    const returned = await unwrap(
      sources.create(group.id, {
        name,
        description,
        ownerId: owner.id,
        fileFormatId: fileFormat.id,
      }),
    );

    const created = await sources.byId(group.id, returned.id);

    expect(returned.id).greaterThan(0);

    expect(returned).toEqual({
      id: returned.id,
      name,
      description,
      ownerId: owner.id,
      fileFormatId: fileFormat.id,
      archived: false,
    });

    expect(created).toEqual(returned);
  });

  it("returns err when group and owner group do not match", async () => {
    const group = await seedGroup();
    const otherGroup = await seedGroup();
    const owner = await seedUser({ group });
    const result = await sources.create(otherGroup.id, { name: "Test", ownerId: owner.id });

    expect(result.isErr).toBe(true);
  });

  it("returns err when group and file format group do not match", async () => {
    const group = await seedGroup();
    const owner = await seedUser({ group });

    const otherGroup = await seedGroup();
    const fileFormat = await seedFileFormat({ group: otherGroup });
    const result = await sources.create(group.id, {
      name: "Test",
      ownerId: owner.id,
      fileFormatId: fileFormat.id,
    });

    expect(result.isErr).toBe(true);
  });

  it("returns err when name is duplicate", async () => {
    const group = await seedGroup();
    const existing = await seedSource({ group });

    const result = await sources.create(group.id, {
      name: existing.name,
      ownerId: existing.ownerId,
    });

    expect(result.isErr).toBe(true);
  });
});

describe("SourceDrizzleRepository.update", () => {
  it("updates source", async () => {
    const name = "Alice WF Checking";
    const description = "Alice's Wells Fargo Checking Account";

    const group = await seedGroup();
    const owner = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });
    const source = await seedSource({ group });

    const result = await sources.update(group.id, source.id, {
      name,
      description,
      ownerId: owner.id,
      fileFormatId: fileFormat.id,
      archived: true,
    });

    expect(result.isOk).toBe(true);

    const updated = await sources.byId(group.id, source.id);

    expect(updated).toEqual({
      id: source.id,
      name,
      description,
      ownerId: owner.id,
      fileFormatId: fileFormat.id,
      archived: true,
    });
  });

  it("returns err when name is duplicate", async () => {
    const group = await seedGroup();
    const existing = await seedSource({ group });
    const toUpdate = await seedSource({ group });

    const result = await sources.update(group.id, toUpdate.id, {
      name: existing.name,
      ownerId: existing.ownerId,
      fileFormatId: existing.fileFormatId,
      archived: false,
    });

    expect(result.isErr).toBe(true);
  });
});

describe("SourceDrizzleRepository.delete", () => {
  it("removes source", async () => {
    const group = await seedGroup();
    const source = await seedSource({ group });

    const result = await sources.delete(group.id, source.id);

    expect(result.isOk).toBe(true);

    const list = await sources.all(group.id);

    expect(list).toEqual([]);
  });
});
