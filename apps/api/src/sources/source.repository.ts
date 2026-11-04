import type { DefaultRepository } from "@/core/types";
import type { CreateSourceInput, UpdateSourceInput } from "@finapp/schema";
import type { Source } from "./source.types";

export interface SourceRepository extends DefaultRepository<
  Source,
  CreateSourceInput,
  UpdateSourceInput
> {
  getByFileFormat(groupId: number, fileFormatPublicId: string): Promise<Source[]>;
}
