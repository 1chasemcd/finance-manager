import { describe, expect, it } from "vitest";
import { createFakeRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";
import { CurrentUser } from "@/identity/current-user";
import { FileFormatService } from "@/file-formats/file-format.service";
import type { WriteFileFormatRequest } from "@finapp/schema";

const repos = createFakeRepositoryContainer();
const { seedGroup, seedUser, seedFileFormat, seedSource } = createDataSeeds(repos);

async function setup() {
  const group = await seedGroup();
  const user = await seedUser({ group });
  const currentUser = new CurrentUser(() => ({ user }));
  return {
    group,
    user,
    service: new FileFormatService(repos.fileFormats, repos.sources, currentUser),
  };
}

describe("FileFormatService.get", () => {
  it("returns fileFormat with specified id", async () => {
    const data = {
      name: "Test File Format",
      positiveIsSpending: true,
      rowPattern: "123",
      skipRows: 2,
      summaryIndex: 1,
      dateIndex: 2,
      amountIndex: 3,
      dateFormat: "yyyymmdd",
    };

    const { group, service } = await setup();
    const fileFormat = await seedFileFormat({ group, ...data });

    expect(await service.get(fileFormat.id)).toEqual({
      id: fileFormat.id,
      canDelete: true,
      ...data,
    });
  });

  it("sets canDelete to false when source uses active file format", async () => {
    const { group, user, service } = await setup();
    const fileFormat = await seedFileFormat({ group });
    await seedSource({ user, fileFormat });

    expect((await service.get(fileFormat.id))?.canDelete).toBe(false);
  });

  it("sets canDelete to false when source uses active file format", async () => {
    const { group, user, service } = await setup();
    const fileFormat = await seedFileFormat({ group });
    await seedSource({ user, fileFormat, archived: true });

    expect((await service.get(fileFormat.id))?.canDelete).toBe(true);
  });
});

describe("FileFormatService.all", () => {
  it("returns all file formats for given groupId", async () => {
    const { group, service } = await setup();
    const f1 = await seedFileFormat({ group });
    const f2 = await seedFileFormat({ group });

    const result = await service.all();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(f1);
    expect(result).toContainEqual(f2);
  });
});

describe("FileFormatService.create", () => {
  it("adds file format to db and returns same file format", async () => {
    const data = {
      name: "Test File Format",
      positiveIsSpending: true,
      rowPattern: "123",
      skipRows: 2,
      summaryIndex: 1,
      dateIndex: 2,
      amountIndex: 3,
      dateFormat: "yyyymmdd",
    };

    const { group, service } = await setup();

    const returned = await unwrap(service.create(data));

    expect(returned.id).greaterThan(0);
    expect(returned).toEqual({
      id: returned.id,
      ...data,
    });

    const created = await repos.fileFormats.byId(group.id, returned.id);
    expect(created).toEqual(returned);
  });
});

describe("FileFormatService.update", () => {
  it("updates file format", async () => {
    const data = {
      name: "Test File Format",
      positiveIsSpending: true,
      rowPattern: "123",
      skipRows: 2,
      summaryIndex: 1,
      dateIndex: 2,
      amountIndex: 3,
      dateFormat: "yyyymmdd",
    };

    const { group, service } = await setup();
    const fileFormat = await seedFileFormat({ group });

    const result = await service.update(fileFormat.id, data);
    expect(result.isOk).toBe(true);

    const updated = await repos.fileFormats.byId(group.id, fileFormat.id);
    expect(updated).toEqual({
      id: fileFormat.id,
      ...data,
    });
  });

  it("returns NotFound when file format does not exist", async () => {
    const { service } = await setup();

    const result = await service.update(-1, {} as WriteFileFormatRequest);

    expect(result.isErr && result.error).toBe("NotFound");
  });
});

describe("FileFormatService.delete", () => {
  it("removes file format", async () => {
    const { group, service } = await setup();
    const fileFormat = await seedFileFormat({ group });

    const result = await service.delete(fileFormat.id);
    expect(result.isOk).toBe(true);

    expect(await repos.fileFormats.all(group.id)).toEqual([]);
  });

  it("returns NotFound when file format does not exist", async () => {
    const { service } = await setup();

    const result = await service.delete(-1);
    expect(result.isErr && result.error).toBe("NotFound");
  });
});
