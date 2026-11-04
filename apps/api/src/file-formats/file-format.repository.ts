import type { Result } from "@finapp/result";
import type { CreateFileFormatInput, FileFormat, UpdateFileFormatInput } from "./file-format.types";

export interface FileFormatRepository {
  byPublicId(groupId: number, publicId: string): Promise<FileFormat | null>;
  all(groupId: number): Promise<FileFormat[]>;
  create(groupId: number, input: CreateFileFormatInput): Promise<Result<FileFormat>>;
  update(groupId: number, publicId: string, input: UpdateFileFormatInput): Promise<Result>;
  delete(groupId: number, publicId: string): Promise<Result>;
}
