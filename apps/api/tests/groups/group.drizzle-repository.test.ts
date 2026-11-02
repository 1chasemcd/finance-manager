import { describe, expect, it } from "vitest";
import { createRepositoryContainer } from "../test-utils/repository-container";
import { createTestD1 } from "../test-utils/d1";

const d1 = await createTestD1();
const { groups } = await createRepositoryContainer(d1);

describe("GroupDrizzleRepository.create", () => {
  it("inserts a group and returns it", async () => {
    const group = await groups.create();

    expect(group.id).toBeGreaterThan(0);
    expect((await d1.prepare("SELECT id FROM groups").all()).results).toEqual([{ id: group.id }]);
  });

  it("assigns a new id to every group", async () => {
    const first = await groups.create();
    const second = await groups.create();

    expect(second.id).not.toBe(first.id);
    expect((await d1.prepare("SELECT id FROM groups ORDER BY id").all()).results).toEqual([
      { id: first.id },
      { id: second.id },
    ]);
  });
});
