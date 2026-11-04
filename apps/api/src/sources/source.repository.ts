import type { Result } from "@finapp/result";
import type { Source } from "./source.types";
import type { CreateSourceInput, UpdateSourceInput } from "@finapp/schema";

export interface SourceRepository {
  byPublicId(groupId: number, publicId: string): Promise<Source | null>;
  all(groupId: number): Promise<Source[]>;
  create(groupId: number, input: CreateSourceInput): Promise<Result<Source>>;
  update(groupId: number, publicId: string, input: UpdateSourceInput): Promise<Result>;
  delete(groupId: number, publicId: string): Promise<Result>;
}
