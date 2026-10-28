import type { Result } from "@finapp/result";
import type { CreateSourceInput, Source, UpdateSourceInput } from "./source.types";
import type { CreateError, DeleteError, UpdateError } from "@/core/errors";

export interface SourceRepository {
  getByPublicId(groupId: number, publicId: string): Promise<Source | null>;
  getByName(groupId: number, name: string): Promise<Source | null>;
  getall(groupId: number): Promise<Source[]>;
  create(groupId: number, input: CreateSourceInput): Promise<Result<Source, CreateError>>;
  update(
    groupId: number,
    publicId: string,
    input: UpdateSourceInput,
  ): Promise<Result<void, UpdateError>>;
  delete(groupId: number, publicId: string): Promise<Result<void, DeleteError>>;
}
