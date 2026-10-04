import type { Db } from "../client";
import { invariant } from "@finapp/result";
import type { GroupRepository } from "../../groups/group.repository";
import type { Group } from "../../groups/group.types";
import { groups } from "../schema";

export class GroupDrizzleRepository implements GroupRepository {
  constructor(private readonly db: Db) {}
  async createGroup(): Promise<Group> {
    const [newRow] = await this.db.insert(groups).values({}).returning();
    invariant(newRow, "Expected new group to be created.");

    return newRow;
  }
}
