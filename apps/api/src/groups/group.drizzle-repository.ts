import type { Db } from "../db/client";
import { invariant } from "@finapp/result";
import type { GroupRepository } from "./group.repository";
import type { Group } from "./group.types";
import { groups } from "../db/schema";

export class GroupDrizzleRepository implements GroupRepository {
  constructor(private readonly db: Db) {}
  async createGroup(): Promise<Group> {
    const [newRow] = await this.db.insert(groups).values({}).returning();
    invariant(newRow, "Expected new group to be created.");

    return newRow;
  }
}
