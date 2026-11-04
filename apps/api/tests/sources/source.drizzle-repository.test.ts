import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";

const repos = await createRepositoryContainer();
const { sources } = repos;
const { seedGroup, seedUser, seedSource, seedFileFormat } = createDataSeeds(repos);

describe("SourceDrizzleRepository.byPublicId", () => {
  it("returns source with specified publicId", async () => {
    const group = await seedGroup();
    const created = await seedSource({ group });

    expect(await sources.byPublicId(group.id, created.publicId)).toEqual(created);
  });

  it("returns null when source is not within request group", async () => {
    const group = await seedGroup();
    const created = await seedSource({ group });
    const otherGroup = await seedGroup();

    expect(await sources.byPublicId(otherGroup.id, created.publicId)).toBeNull();
  });

  it("returns null for an unknown groupId and publicId", async () => {
    expect(await sources.byPublicId(0, "missing")).toBeNull();
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
    const group = await seedGroup();
    const owner = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });

    const returned = await unwrap(
      sources.create(group.id, {
        name: "Bob WF Checking",
        description: "Bob's Wells Fargo Checking Account",
        ownerEmail: owner.email,
        fileFormatPublicId: fileFormat.publicId,
      }),
    );

    const created = await sources.byPublicId(group.id, returned.publicId);

    expect(created).toMatchObject({
      name: "Bob WF Checking",
      description: "Bob's Wells Fargo Checking Account",
      ownerEmail: owner.email,
      fileFormatPublicId: fileFormat.publicId,
      archived: false,
    });
    expect(created?.publicId.length).greaterThan(0);
    expect(created).toEqual(returned);
  });

  it("returns err when group and owner group do not match", async () => {
    const group = await seedGroup();
    const otherGroup = await seedGroup();
    const owner = await seedUser({ group });
    const result = await sources.create(otherGroup.id, { name: "Test", ownerEmail: owner.email });

    expect(result.isErr).toBe(true);
  });

  it("returns err when group and file format group do not match", async () => {
    const group = await seedGroup();
    const owner = await seedUser({ group });

    const otherGroup = await seedGroup();
    const fileFormat = await seedFileFormat({ group: otherGroup });
    const result = await sources.create(group.id, {
      name: "Test",
      ownerEmail: owner.email,
      fileFormatPublicId: fileFormat.publicId,
    });

    expect(result.isErr).toBe(true);
  });

  it("returns err when name is duplicate", async () => {
    const group = await seedGroup();
    const existing = await seedSource({ group });

    const result = await sources.create(group.id, {
      name: existing.name,
      ownerEmail: existing.ownerEmail,
    });

    expect(result.isErr).toBe(true);
  });
});

describe("SourceDrizzleRepository.update", () => {
  it("updates source", async () => {
    const group = await seedGroup();
    const owner = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });
    const source = await seedSource({ group });

    const result = await sources.update(group.id, source.publicId, {
      name: "Alice WF Checking",
      description: "Alice's Wells Fargo Checking Account",
      ownerEmail: owner.email,
      fileFormatPublicId: fileFormat.publicId,
      archived: true,
    });

    expect(result.isOk).toBe(true);

    const updated = await sources.byPublicId(group.id, source.publicId);

    expect(updated).toMatchObject({
      name: "Alice WF Checking",
      description: "Alice's Wells Fargo Checking Account",
      ownerEmail: owner.email,
      fileFormatPublicId: fileFormat.publicId,
      archived: true,
    });
  });

  it("returns err when name is duplicate", async () => {
    const group = await seedGroup();
    const existing = await seedSource({ group });
    const toUpdate = await seedSource({ group });

    const result = await sources.update(group.id, toUpdate.publicId, {
      name: existing.name,
    });

    expect(result.isErr).toBe(true);
  });
});

describe("SourceDrizzleRepository.delete", () => {
  it("removes source", async () => {
    const group = await seedGroup();
    const source = await seedSource({ group });

    const result = await sources.delete(group.id, source.publicId);

    expect(result.isOk).toBe(true);

    const list = await sources.all(group.id);

    expect(list).toEqual([]);
  });
});
