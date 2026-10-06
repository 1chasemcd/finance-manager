import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDb, type Db } from "../../src/db/client";
import { GroupDrizzleRepository } from "../../src/groups/group.drizzle-repository";
import { createTestDatabase, type TestDatabase } from "../test-utils/fake-d1";
import { applyMigrations } from "../test-utils/migrations";

let database: TestDatabase;
let db: Db;
let groups: GroupDrizzleRepository;

beforeEach(() => {
  database = createTestDatabase();
  applyMigrations(database);
  db = createDb(database.d1);
  groups = new GroupDrizzleRepository(db);
});

afterEach(() => {
  database.close();
});

describe("GroupDrizzleRepository.createGroup", () => {
  it("inserts a group and returns it", async () => {
    const group = await groups.createGroup();

    expect(group.id).toBeGreaterThan(0);
    expect(database.all("SELECT id FROM groups")).toEqual([{ id: group.id }]);
  });

  it("assigns a new id to every group", async () => {
    const first = await groups.createGroup();
    const second = await groups.createGroup();

    expect(second.id).not.toBe(first.id);
    expect(database.all("SELECT id FROM groups ORDER BY id")).toEqual([
      { id: first.id },
      { id: second.id },
    ]);
  });
});
