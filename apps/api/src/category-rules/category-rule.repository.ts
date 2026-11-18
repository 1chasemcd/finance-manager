import type { Result } from "@finapp/result";
import type { FileFormat } from "./category-rule.types";
import type { WriteFileFormatRequest } from "@finapp/schema";

export interface FileFormatRepository {
  all(groupId: number): Promise<FileFormat[]>;
  byId(groupId: number, id: number): Promise<FileFormat | undefined>;
  create(groupId: number, input: WriteFileFormatRequest): Promise<Result<FileFormat>>;
  update(groupId: number, id: number, input: WriteFileFormatRequest): Promise<Result>;
  delete(groupId: number, id: number): Promise<Result>;
}
