import type { Result } from "@finapp/result";
import type { WriteFileFormatInput, FileFormat } from "./file-format.types";

export interface FileFormatRepository {
  all(groupId: number): Promise<FileFormat[]>;
  byId(groupId: number, id: number): Promise<FileFormat | undefined>;
  create(groupId: number, input: WriteFileFormatInput): Promise<Result<FileFormat>>;
  update(groupId: number, id: number, input: WriteFileFormatInput): Promise<Result>;
  delete(groupId: number, id: number): Promise<Result>;
}
