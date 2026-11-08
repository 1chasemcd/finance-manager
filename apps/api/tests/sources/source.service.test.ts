import { describe, expect, it } from "vitest";
import { createFakeRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap, unwrapError } from "../test-utils/unwrap";
import { SourceService } from "@/sources/source.service";
import { CurrentUser } from "@/identity/current-user";

const repos = createFakeRepositoryContainer();
const { seedGroup, seedUser, seedSource, seedFileFormat } = createDataSeeds(repos);

async function setup() {
  const group = await seedGroup();
  const user = await seedUser({ group });
  const currentUser = new CurrentUser(() => ({ user }));
  return {
    group,
    user,
    service: new SourceService(repos.sources, repos.users, repos.fileFormats, currentUser),
  };
}

describe("SourceService.get", () => {
  it("returns source with specified publicId", async () => {
    const { group, user, service } = await setup();
    const fileFormat = await seedFileFormat({ group });
    const source = await seedSource({ user, fileFormat });

    expect(await service.get(source.publicId)).toEqual({
      canDelete: true,
      fileFormatId: fileFormat.publicId,
      description: null,
      id: source.publicId,
      name: source.name,
      ownerEmail: user.email,
      archived: false,
    });
  });

  it("returns undefined when source is not within request group", async () => {
    const { service } = await setup();
    const foreignGroup = await seedGroup();
    const created = await seedSource({ group: foreignGroup });

    expect(await service.get(created.publicId)).toBeUndefined();
  });

  it("returns undefined for an unknown groupId and publicId", async () => {
    const { service } = await setup();
    expect(await service.get("missing")).toBeUndefined();
  });
});

describe("SourceService.all", () => {
  it("returns all sources for given groupId", async () => {
    const { group, service } = await setup();
    const s1 = await seedSource({ group });
    const s2 = await seedSource({ group });

    const result = await service.all();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      archived: false,
      description: null,
      id: s1.publicId,
      name: s1.name,
    });
    expect(result).toContainEqual({
      archived: false,
      description: null,
      id: s2.publicId,
      name: s2.name,
    });
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
    const { group, service } = await setup();
    const owner = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });

    const returned = await unwrap(
      service.create({
        name: "Bob WF Checking",
        description: "Bob's Wells Fargo Checking Account",
        ownerEmail: owner.email,
        fileFormatId: fileFormat.publicId,
      }),
    );

    expect(returned.id.length).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      name: "Bob WF Checking",
      description: "Bob's Wells Fargo Checking Account",
      archived: false,
    });

    const created = await repos.sources.byPublicId(group.id, returned.id);
    expect(created).toEqual({
      id: created?.id,
      publicId: created?.publicId,
      name: "Bob WF Checking",
      description: "Bob's Wells Fargo Checking Account",
      owner,
      fileFormat,
      archived: false,
    });
  });

  it("returns NotFound when owner not found", async () => {
    const { service } = await setup();

    const result = await unwrapError(
      service.create({
        name: "Test",
        ownerEmail: "fake@gmail.com",
      }),
    );
    expect(result).toBe("NotFound");
  });

  it("returns NotFound when file Format not found", async () => {
    const { user, service } = await setup();

    const result = await unwrapError(
      service.create({
        name: "Test",
        ownerEmail: user.email,
        fileFormatId: "fake",
      }),
    );
    expect(result).toBe("NotFound");
  });
});

describe("SourceService.update", () => {
  it("updates source", async () => {
    const { group, user, service } = await setup();

    const otherUser = await seedUser({ group });
    const fileFormat = await seedFileFormat({ group });
    const source = await seedSource({ user });

    const result = await service.update(source.publicId, {
      name: "Alice WF Checking",
      description: "Alice's Wells Fargo Checking Account",
      ownerEmail: otherUser.email,
      fileFormatId: fileFormat.publicId,
      archived: true,
    });

    expect(result.isOk).toBe(true);

    const updated = await repos.sources.byPublicId(group.id, source.publicId);

    expect(updated).toEqual({
      id: source.id,
      publicId: source.publicId,
      name: "Alice WF Checking",
      description: "Alice's Wells Fargo Checking Account",
      owner: otherUser,
      fileFormat: fileFormat,
      archived: true,
    });
  });

  it("returns NotFound when source does not exist", async () => {
    const { user, service } = await setup();

    const result = await service.update("fake", {
      name: "Test",
      ownerEmail: user.email,
      archived: false,
    });

    expect(result.isErr && result.error).toBe("NotFound");
  });
});

describe("SourceService.delete", () => {
  it("removes source", async () => {
    const { group, service } = await setup();
    const source = await seedSource({ group });

    const result = await service.delete(source.publicId);
    expect(result.isOk).toBe(true);

    const list = await repos.sources.all(group.id);
    expect(list).toEqual([]);
  });

  it("returns NotFound when source does not exist", async () => {
    const { service } = await setup();

    const result = await service.delete("fake");
    expect(result.isErr && result.error).toBe("NotFound");
  });
});
