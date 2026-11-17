import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createDataSeeds } from "../test-utils/seeds";
import { unwrap } from "../test-utils/unwrap";

const repos = await createRepositoryContainer();
const { fileFormats } = repos;
const { seedGroup, seedFileFormat } = createDataSeeds(repos);

describe("FileFormatDrizzleRepository.byId", () => {
  it("returns file format with specified id", async () => {
    const group = await seedGroup();
    const fileFormat = await seedFileFormat({ group });

    expect(await fileFormats.byId(group.id, fileFormat.id)).toEqual({
      id: fileFormat.id,
      name: fileFormat.name,
      skipRows: 0,
      rowPattern: null,
      dateIndex: 0,
      summaryIndex: 0,
      amountIndex: 0,
      dateFormat: null,
      positiveIsSpending: false,
    });
  });
});

describe("FileFormatDrizzleRepository.all", () => {
  it("returns all file formats", async () => {
    const group = await seedGroup();
    const fileFormat = await seedFileFormat({ group });

    expect(await fileFormats.all(group.id)).toEqual([
      {
        id: fileFormat.id,
        name: fileFormat.name,
        skipRows: 0,
        rowPattern: null,
        dateIndex: 0,
        summaryIndex: 0,
        amountIndex: 0,
        dateFormat: null,
        positiveIsSpending: false,
      },
    ]);
  });
});

describe("FileFormatDrizzleRepository.create", () => {
  it("creates file format", async () => {
    const fileFormatData = {
      name: "Test",
      skipRows: 1,
      rowPattern: "xxx",
      dateIndex: 1,
      summaryIndex: 2,
      amountIndex: 3,
      dateFormat: "mmddyyyy",
      positiveIsSpending: true,
    };
    const group = await seedGroup();

    const returned = await unwrap(fileFormats.create(group.id, fileFormatData));
    const created = await fileFormats.byId(group.id, returned.id);

    expect(returned).toEqual({ id: returned.id, ...fileFormatData });
    expect(returned).toEqual(created);
  });
});

describe("FileFormatDrizzleRepository.update", () => {
  it("updates file format", async () => {
    const fileFormatData = {
      name: "Test",
      skipRows: 1,
      rowPattern: "xxx",
      dateIndex: 1,
      summaryIndex: 2,
      amountIndex: 3,
      dateFormat: "mmddyyyy",
      positiveIsSpending: true,
    };
    const group = await seedGroup();
    const fileFormat = await seedFileFormat({ group });

    await unwrap(fileFormats.update(group.id, fileFormat.id, fileFormatData));
    const updated = await fileFormats.byId(group.id, fileFormat.id);

    expect(updated).toEqual({ id: fileFormat.id, ...fileFormatData });
  });
});

describe("FileFormatDrizzleRepository.delete", () => {
  it("deletes file format", async () => {
    const group = await seedGroup();
    const fileFormat = await seedFileFormat({ group });

    await unwrap(fileFormats.delete(group.id, fileFormat.id));
    const result = await fileFormats.all(group.id);

    expect(result).toEqual([]);
  });
});
