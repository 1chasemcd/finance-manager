import type { Result } from "@finapp/result";
import type { CreateSourceInput, Source, UpdateSourceInput } from "./source.types";

export interface SourceRepository {
  byPublicId(groupId: number, publicId: string): Promise<Source | null>;
  all(groupId: number): Promise<Source[]>;
  create(groupId: number, input: CreateSourceInput): Promise<Result<Source>>;
  update(groupId: number, publicId: string, input: UpdateSourceInput): Promise<Result>;
  delete(groupId: number, publicId: string): Promise<Result>;
}
