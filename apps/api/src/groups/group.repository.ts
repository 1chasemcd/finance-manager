import type { Group } from "./group.types";

export interface GroupRepository {
  create(): Promise<Group>;
}
