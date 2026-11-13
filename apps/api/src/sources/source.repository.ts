import type { CreateSourceRequest, UpdateSourceRequest } from "@finapp/schema";
import type { Source } from "./source.types";
import type { Result } from "@finapp/result";

export interface SourceRepository {
  byId(groupId: number, id: number): Promise<Source | undefined>;
  byFileFormat(groupId: number, fileFormatId: number): Promise<Source[]>;
  all(groupId: number): Promise<Source[]>;
  create(groupId: number, input: CreateSourceRequest): Promise<Result<Source>>;
  update(groupId: number, id: number, input: UpdateSourceRequest): Promise<Result>;
  delete(groupId: number, id: number): Promise<Result>;
}
