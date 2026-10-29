import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";

const repositories = createRepositoryContainer();
const { seedGroup, seedSource } = createDataSeeds(repositories);

describe("SourceDrizzleRepository.byPublicId", () => {
  it("returns source with specified publicId", async () => {
    const { sources } = repositories;
    const group = await seedGroup();
    const created = await seedSource({ group });

    expect(await sources.byPublicId(group.id, created.publicId)).toEqual(created);
  });

  it("returns null for an unknown groupId and publicId", async () => {
    const { sources } = repositories;
    expect(await sources.byPublicId(0, "missing")).toBeNull();
  });
});
