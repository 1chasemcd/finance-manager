import type { Result } from "@finapp/result";
import type { Conflict, NotFound } from "@/core/errors";
import type { FileFormat } from "./file-format.types";

interface CreateFileFormatInput {
  name: string;
  skipRows: number;
  rowPattern?: string;
  dateIndex: number;
  summaryIndex: number;
  amountIndex: number;
  dateFormat?: string;
  positiveIsSpending: boolean;
}

type UpdateFileFormatInput = Partial<CreateFileFormatInput>;

export interface FileFormatRepository {
  get(groupId: number, publicId: string): Promise<Result<FileFormat, NotFound>>;
  getall(groupId: number): Promise<FileFormat[]>;
  create(groupId: number, input: CreateFileFormatInput): Promise<Result<FileFormat, Conflict>>;
  update(
    groupId: number,
    publicId: string,
    input: UpdateFileFormatInput,
  ): Promise<Result<FileFormat, Conflict | NotFound>>;
  delete(groupId: number, publicId: string): Promise<Result<void, NotFound>>;
}
