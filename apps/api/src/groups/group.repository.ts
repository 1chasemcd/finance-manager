import type { Group } from "./group.types";

export interface GroupRepository {
  createGroup(): Promise<Group>;
}
