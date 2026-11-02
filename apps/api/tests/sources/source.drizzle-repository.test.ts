import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";

const repos = await createRepositoryContainer();
const { sources } = repos;
const { seedGroup, seedSource } = createDataSeeds(repos);

describe("SourceDrizzleRepository.byPublicId", () => {
  it("returns source with specified publicId", async () => {
    const group = await seedGroup();
    const created = await seedSource({ group });

    expect(await sources.byPublicId(group.id, created.publicId)).toEqual(created);
  });

  it("returns null for an unknown groupId and publicId", async () => {
    expect(await sources.byPublicId(0, "missing")).toBeNull();
  });
});
