import type { CreateSourceInput, Source, SourceDetail, UpdateSourceInput } from "./source.types";
import type { Result } from "@finapp/result";

export interface SourceRepository {
  byPublicId(groupId: number, publicId: string): Promise<SourceDetail | undefined>;
  byFileFormat(groupId: number, fileFormatId: number): Promise<Source[]>;
  all(groupId: number): Promise<Source[]>;
  create(groupId: number, input: CreateSourceInput): Promise<Result<Source>>;
  update(groupId: number, id: number, input: UpdateSourceInput): Promise<Result>;
  delete(groupId: number, id: number): Promise<Result>;
}
